import { CheckCircle, XCircle } from "lucide-react";
import { Card } from "./ui/card";
import { snakeCaseToTitleCase } from "../utils/jsonPreprocessor";

interface ValidationRule {
  name: string;
  isValid: boolean;
  message: string;
  extractedData?: Record<string, any>;
}

interface OficioB3ValidationProps {
  data: any;
}

// Helper to format snake_case to human readable
const formatLabel = (text: string): string => {
  if (!text || typeof text !== "string") return text;
  
  // Use the enhanced formatter from jsonPreprocessor
  return snakeCaseToTitleCase(text);
};

// Helper to get nested value safely
const getNestedValue = (obj: any, path: string): any => {
  const keys = path.split(".");
  let value = obj;

  for (const key of keys) {
    if (value && typeof value === "object") {
      value = value[key];
    } else {
      return undefined;
    }
  }

  return value;
};

export function OficioB3Validation({ data }: OficioB3ValidationProps) {
  // Check if it's oficio_b3 type
  const isOficioB3 = data?.doc_type === "oficio_b3";
  
  if (!isOficioB3) {
    return null;
  }

  const oficio = data?.oficio || {};

  // Validation 1: Direcionado à B3
  const validateB3Address = (): ValidationRule => {
    const endereco = getNestedValue(oficio, "destinatario_b3.endereco");
    
    const expectedAddress = {
      cep: "01013-001",
      cidade: "São Paulo",
      linha1: "Rua Quinze De Novembro, Nº 275 Centro",
      linha2: "Cep: 01013-001 - São Paulo - Sp",
      uf: "SP",
    };

    const isValid =
      endereco &&
      endereco.cep === expectedAddress.cep &&
      endereco.cidade === expectedAddress.cidade &&
      endereco.linha1 === expectedAddress.linha1 &&
      endereco.linha2 === expectedAddress.linha2 &&
      endereco.uf === expectedAddress.uf;

    return {
      name: "Direcionado à B3",
      isValid: !!isValid,
      message: isValid
        ? "Endereço do destinatário B3 válido"
        : "Endereço do destinatário B3 inválido ou incompleto",
      extractedData: endereco
        ? {
            CEP: endereco.cep,
            Cidade: endereco.cidade,
            Endereço: endereco.linha1,
            UF: endereco.uf,
          }
        : undefined,
    };
  };

  // Validation 2: Solicitação
  const validateSolicitacao = (): ValidationRule => {
    const assunto = oficio.assunto;
    const solicitacao = oficio.solicitacao;
    const tipoAssunto = oficio.tipo_assunto;

    const hasBaixaGravame =
      solicitacao &&
      typeof solicitacao === "string" &&
      solicitacao.toLowerCase().includes("baixa de gravame");

    const isValid =
      assunto &&
      assunto.trim() !== "" &&
      hasBaixaGravame &&
      tipoAssunto === "baixa_gravame";

    return {
      name: "Solicitação",
      isValid,
      message: isValid
        ? "Solicitação válida com assunto e tipo corretos"
        : "Solicitação inválida - verifique assunto, texto e tipo",
      extractedData: {
        Assunto: formatLabel(assunto || "—"),
        "Tipo de Assunto": formatLabel(tipoAssunto || "—"),
        "Contém 'Baixa de Gravame'": hasBaixaGravame ? "Sim" : "Não",
      },
    };
  };

  // Validation 3: Motivo e Destinação
  const validateMotivoDestinacao = (): ValidationRule => {
    const motivoDestinacao = oficio.motivo_destinacao;
    const motivo = motivoDestinacao?.motivo;
    const destinacao = motivoDestinacao?.destinacao;

    const isValid =
      motivo &&
      motivo.trim() !== "" &&
      destinacao &&
      destinacao.trim() !== "";

    return {
      name: "Motivo e Destinação",
      isValid,
      message: isValid
        ? "Motivo e destinação preenchidos"
        : "Motivo ou destinação ausentes",
      extractedData: {
        Motivo: formatLabel(motivo || "—"),
        Destinação: formatLabel(destinacao || "—"),
      },
    };
  };

  // Validation 4: Dados do Veículo
  const validateVeiculo = (): ValidationRule => {
    const veiculos = oficio.veiculos;
    
    if (!Array.isArray(veiculos) || veiculos.length === 0) {
      return {
        name: "Dados do Veículo",
        isValid: false,
        message: "Nenhum veículo encontrado",
      };
    }

    const veiculo = veiculos[0]; // Check first vehicle
    // Renavam is optional - only validate required fields: placa, chassi, uf
    const isValid =
      veiculo &&
      veiculo.placa &&
      veiculo.placa.trim() !== "" &&
      veiculo.chassi &&
      veiculo.chassi.trim() !== "" &&
      veiculo.uf &&
      veiculo.uf.trim() !== "";

    return {
      name: "Dados do Veículo",
      isValid,
      message: isValid
        ? `Veículo válido (${veiculos.length} veículo${veiculos.length > 1 ? "s" : ""} encontrado${veiculos.length > 1 ? "s" : ""})`
        : "Dados do veículo incompletos (obrigatórios: placa, chassi, UF)",
      extractedData: veiculo
        ? {
            Placa: veiculo.placa || "—",
            Chassi: veiculo.chassi || "—",
            "Renavam (opcional)": veiculo.renavam || "—",
            UF: veiculo.uf || "—",
          }
        : undefined,
    };
  };

  // Validation 5: Solicitante
  const validateSolicitante = (): ValidationRule => {
    const solicitante = oficio.solicitante;
    const orgao = solicitante?.orgao;
    const unidade = solicitante?.unidade;

    const isValid =
      orgao && orgao.trim() !== "" && unidade && unidade.trim() !== "";

    return {
      name: "Solicitante",
      isValid,
      message: isValid
        ? "Dados do solicitante completos"
        : "Órgão ou unidade ausentes",
      extractedData: {
        Órgão: orgao || "—",
        Unidade: unidade || "—",
      },
    };
  };

  // Run all validations
  const validations: ValidationRule[] = [
    validateB3Address(),
    validateSolicitacao(),
    validateMotivoDestinacao(),
    validateVeiculo(),
    validateSolicitante(),
  ];

  const allValid = validations.every((v) => v.isValid);
  const validCount = validations.filter((v) => v.isValid).length;

  return (
    <Card
      className="p-6 mt-6"
      style={{ backgroundColor: "var(--sn-form-bg)" }}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 style={{ margin: 0 }}>
            Validação Específica - Ofício B3
          </h3>
          <div
            className="px-3 py-1 rounded"
            style={{
              backgroundColor: allValid
                ? "rgba(40, 167, 69, 0.1)"
                : "rgba(255, 193, 7, 0.1)",
              border: `1px solid ${allValid ? "var(--sn-success)" : "var(--sn-warning)"}`,
            }}
          >
            <span
              style={{
                color: allValid
                  ? "var(--sn-success)"
                  : "var(--sn-warning)",
                fontFamily: "var(--font-lato)",
              }}
            >
              {validCount}/{validations.length} válidos
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {validations.map((validation, index) => (
            <div
              key={index}
              className="p-4 rounded border"
              style={{
                backgroundColor: validation.isValid
                  ? "rgba(40, 167, 69, 0.05)"
                  : "rgba(220, 53, 69, 0.05)",
                borderColor: validation.isValid
                  ? "var(--sn-success)"
                  : "var(--sn-danger)",
              }}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {validation.isValid ? (
                    <CheckCircle
                      className="w-5 h-5"
                      style={{ color: "var(--sn-success)" }}
                    />
                  ) : (
                    <XCircle
                      className="w-5 h-5"
                      style={{ color: "var(--sn-danger)" }}
                    />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4
                      style={{
                        margin: 0,
                        fontFamily: "var(--font-lato)",
                      }}
                    >
                      {validation.name}
                    </h4>
                    <span
                      className="px-2 py-0.5 rounded text-xs"
                      style={{
                        backgroundColor: validation.isValid
                          ? "var(--sn-success)"
                          : "var(--sn-danger)",
                        color: "white",
                        fontFamily: "var(--font-lato)",
                      }}
                    >
                      {validation.isValid ? "✓ VÁLIDO" : "✗ INVÁLIDO"}
                    </span>
                  </div>
                  <p
                    style={{
                      margin: "4px 0 0 0",
                      opacity: 0.8,
                      fontFamily: "var(--font-lato)",
                    }}
                  >
                    {validation.message}
                  </p>

                  {validation.extractedData && (
                    <div
                      className="mt-3 p-3 rounded"
                      style={{
                        backgroundColor: "var(--sn-background-dark)",
                      }}
                    >
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(
                          validation.extractedData,
                        ).map(([key, value]) => (
                          <div key={key}>
                            <div
                              style={{
                                fontSize: "0.75em",
                                opacity: 0.7,
                                marginBottom: "2px",
                                fontFamily: "var(--font-lato)",
                              }}
                            >
                              {key}
                            </div>
                            <div
                              style={{
                                fontFamily:
                                  "var(--sn-font-family-mono)",
                                fontSize: "0.9em",
                                color: "var(--sn-input-text)",
                              }}
                            >
                              {typeof value === "string"
                                ? value
                                : JSON.stringify(value)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
