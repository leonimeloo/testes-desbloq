import { CheckCircle, XCircle } from "lucide-react";
import { Card } from "./ui/card";

interface ValidationRule {
  name: string;
  isValid: boolean;
  message: string;
  extractedData?: Record<string, any>;
}

interface DocumentoComprobatorioValidationProps {
  data: any;
}

export function DocumentoComprobatorioValidation({
  data,
}: DocumentoComprobatorioValidationProps) {
  // Check if it's documento_comprobatorio type
  const isDocumentoComprobatorio =
    data?.doc_type === "documento_comprobatorio";

  if (!isDocumentoComprobatorio) {
    return null;
  }

  // Validation: Processo Administrativo Format
  const validateProcessoAdministrativo = (): ValidationRule => {
    const processoAdministrativo = data?.processo_administrativo;

    // Check if field exists and is not empty
    if (
      !processoAdministrativo ||
      processoAdministrativo.trim() === ""
    ) {
      return {
        name: "Processo Administrativo",
        isValid: false,
        message: "Campo 'processo_administrativo' ausente ou vazio",
        extractedData: {
          "Processo Administrativo": "—",
          Formato: "—",
        },
      };
    }

    // Validate format: XXXXX.XXXXXX/YYYY-DD
    // X = digit, Y = year (4 digits), D = 2 digits
    const formatRegex = /^\d{5}\.\d{6}\/\d{4}-\d{2}$/;
    const isValid = formatRegex.test(processoAdministrativo);

    return {
      name: "Processo Administrativo",
      isValid,
      message: isValid
        ? "Formato de processo administrativo válido"
        : "Formato inválido. Esperado: XXXXX.XXXXXX/YYYY-DD",
      extractedData: {
        "Processo Administrativo": processoAdministrativo,
        Formato: isValid ? "✓ Válido" : "✗ Inválido",
        "Padrão Esperado": "XXXXX.XXXXXX/YYYY-DD",
      },
    };
  };

  // Run validation
  const validation = validateProcessoAdministrativo();

  return (
    <Card
      className="p-6"
      style={{ backgroundColor: "var(--sn-form-bg)" }}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 style={{ margin: 0 }}>
            Validação Específica - Documento Comprobatório
          </h3>
          <div
            className="px-3 py-1 rounded"
            style={{
              backgroundColor: validation.isValid
                ? "rgba(40, 167, 69, 0.1)"
                : "rgba(220, 53, 69, 0.1)",
              border: `1px solid ${validation.isValid ? "var(--sn-success)" : "var(--sn-danger)"}`,
            }}
          >
            <span
              style={{
                color: validation.isValid
                  ? "var(--sn-success)"
                  : "var(--sn-danger)",
                fontFamily: "var(--font-lato)",
              }}
            >
              {validation.isValid ? "Válido" : "Inválido"}
            </span>
          </div>
        </div>

        {/* Validation Result */}
        <div
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
                  {validation.isValid ? "Válido" : "Inválido"}
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

              {/* Display extracted data */}
              {validation.extractedData && (
                <div
                  className="mt-3 p-3 rounded"
                  style={{
                    backgroundColor: "var(--sn-background-dark)",
                    border: "1px solid var(--sn-input-border)",
                  }}
                >
                  <div className="space-y-2">
                    {Object.entries(validation.extractedData).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="flex justify-between gap-3"
                          style={{
                            fontFamily: "var(--font-lato)",
                          }}
                        >
                          <span
                            style={{
                              opacity: 0.7,
                              fontSize: "0.9em",
                            }}
                          >
                            {key}:
                          </span>
                          <span
                            style={{
                              fontFamily:
                                key === "Processo Administrativo" ||
                                key === "Padrão Esperado"
                                  ? "var(--sn-font-family-mono)"
                                  : "var(--font-lato)",
                              color:
                                value === "—"
                                  ? "var(--sn-danger)"
                                  : "var(--sn-input-text)",
                              opacity: value === "—" ? 0.5 : 1,
                            }}
                          >
                            {value}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}

              {/* Format Example */}
              {!validation.isValid && (
                <div
                  className="mt-3 p-3 rounded"
                  style={{
                    backgroundColor: "rgba(255, 193, 7, 0.1)",
                    border: "1px solid var(--sn-warning)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.9em",
                      color: "var(--sn-warning)",
                      fontFamily: "var(--font-lato)",
                    }}
                  >
                    <strong>Exemplo de formato válido:</strong>
                  </div>
                  <code
                    style={{
                      display: "block",
                      marginTop: "8px",
                      padding: "8px",
                      backgroundColor: "var(--sn-background-dark)",
                      borderRadius: "var(--sn-border-radius)",
                      fontFamily: "var(--sn-font-family-mono)",
                      color: "var(--sn-success)",
                    }}
                  >
                    12345.678901/2024-01
                  </code>
                  <div
                    style={{
                      marginTop: "8px",
                      fontSize: "0.85em",
                      opacity: 0.8,
                      fontFamily: "var(--font-lato)",
                    }}
                  >
                    Formato: 5 dígitos + ponto + 6 dígitos + barra + 4
                    dígitos (ano) + hífen + 2 dígitos
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
