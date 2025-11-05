import { useState } from "react";
import {
  Copy,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  CheckCircle,
  XCircle as XCircleIcon,
  Upload,
  FileText,
  Loader2,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { toast } from "sonner@2.0.3";
import { preprocessJson } from "../utils/jsonPreprocessor";

type ValidationStatus =
  | "idle"
  | "success"
  | "partial"
  | "error";

interface ValidationResult {
  status: ValidationStatus;
  message: string;
  missingFields: string[];
  presentFields: string[];
  formattedJson: string;
  extractedData: Record<string, any>;
}

interface DesbloqueioData {
  cpf: string[];
  cnpj: string[];
  chassi: string[];
  placa: string[];
  nome_financiado: string[];
  text: string;
}

const requiredFields = [
  "cpf",
  "cnpj",
  "chassi",
  "placa",
  "nome_financiado",
];

// Visual mapping for field display names
const fieldDisplayMapping: Record<string, string> = {
  "cpf": "cpf",
  "cnpj": "cnpj",
  "chassi": "chassi",
  "placa": "placa",
  "nome_financiado": "pessoas_identificadas",
};

export function DesbloqueioPanel() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === "application/pdf") {
        setSelectedFile(file);
        setValidationResult(null);
      } else {
        toast.error("Por favor, selecione um arquivo PDF válido");
      }
    }
  };

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

  const isFieldPresent = (
    parsed: any,
    fieldSpec: string,
  ): boolean => {
    const alternatives = fieldSpec.split("|");

    for (const field of alternatives) {
      const value = getNestedValue(parsed, field);

      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        if (Array.isArray(value)) {
          if (value.length > 0) return true;
        } else {
          return true;
        }
      }
    }

    return false;
  };

  const validateJson = (jsonData: string) => {
    try {
      const preprocessed = preprocessJson(jsonData);
      const parsed = preprocessed.original;
      const formatted = preprocessed.normalizedString;

      const presentFields = requiredFields.filter((field) =>
        isFieldPresent(parsed, field),
      );
      const missingFields = requiredFields.filter(
        (field) => !presentFields.includes(field),
      );

      let status: ValidationStatus;
      let message: string;

      if (missingFields.length === 0) {
        status = "success";
        message =
          "Todos os campos obrigatórios estão presentes!";
        toast.success(message);
      } else if (presentFields.length > 0) {
        status = "partial";
        message = `${presentFields.length} de ${requiredFields.length} campos presentes`;
        toast.warning(message);
      } else {
        status = "error";
        message = "Nenhum campo obrigatório encontrado";
        toast.error(message);
      }

      setValidationResult({
        status,
        message,
        missingFields,
        presentFields,
        formattedJson: formatted,
        extractedData: parsed,
      });
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : "JSON inválido - verifique a sintaxe";
      
      setValidationResult({
        status: "error",
        message: errorMessage,
        missingFields: requiredFields,
        presentFields: [],
        formattedJson: "",
        extractedData: {},
      });
      toast.error(errorMessage);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Por favor, selecione um arquivo PDF");
      return;
    }

    setIsLoading(true);
    setValidationResult(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(
        "https://api-desbloqueio-b3-631188825498.europe-west1.run.app/vehicles",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status}`);
      }

      let data = await response.json();
      
      // Handle array response format: [data, statusCode]
      if (Array.isArray(data) && data.length > 0) {
        data = data[0];
      }
      
      // Validate the returned JSON
      const jsonString = JSON.stringify(data, null, 2);
      validateJson(jsonString);
      
      toast.success("PDF processado com sucesso!");
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Erro ao processar o PDF";
      
      toast.error(errorMessage);
      setValidationResult({
        status: "error",
        message: errorMessage,
        missingFields: requiredFields,
        presentFields: [],
        formattedJson: "",
        extractedData: {},
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (validationResult?.formattedJson) {
      const textArea = document.createElement("textarea");
      textArea.value = validationResult.formattedJson;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        document.execCommand("copy");
        toast.success(
          "JSON copiado para área de transferência",
        );
      } catch (err) {
        toast.error("Erro ao copiar JSON");
      } finally {
        document.body.removeChild(textArea);
      }
    }
  };

  const getStatusConfig = (status: ValidationStatus) => {
    switch (status) {
      case "success":
        return {
          icon: <CheckCircle2 className="w-5 h-5" />,
          color: "var(--sn-success)",
          bgColor: "rgba(40, 167, 69, 0.1)",
          label: "Sucesso",
        };
      case "partial":
        return {
          icon: <AlertTriangle className="w-5 h-5" />,
          color: "var(--sn-warning)",
          bgColor: "rgba(255, 193, 7, 0.1)",
          label: "Parcial",
        };
      case "error":
        return {
          icon: <XCircle className="w-5 h-5" />,
          color: "var(--sn-danger)",
          bgColor: "rgba(220, 53, 69, 0.1)",
          label: "Erro",
        };
      default:
        return null;
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card
          className="p-6"
          style={{ backgroundColor: "var(--sn-form-bg)" }}
        >
          <div className="space-y-4">
            <div>
              <h3 style={{ margin: "0 0 8px 0" }}>
                Upload de PDF
              </h3>
              <p style={{ opacity: 0.7, margin: "0 0 16px 0" }}>
                Selecione um arquivo PDF para extrair informações de veículos
              </p>
            </div>

            {/* File Input Area */}
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors hover:border-opacity-80"
              style={{
                borderColor: selectedFile 
                  ? "var(--sn-success)" 
                  : "var(--sn-input-border)",
                backgroundColor: selectedFile
                  ? "rgba(40, 167, 69, 0.05)"
                  : "var(--sn-input-bg)",
              }}
              onClick={() => document.getElementById("file-input")?.click()}
            >
              <input
                id="file-input"
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              
              {selectedFile ? (
                <div className="flex flex-col items-center gap-3">
                  <FileText
                    className="w-12 h-12"
                    style={{ color: "var(--sn-success)" }}
                  />
                  <div>
                    <p style={{ margin: "0 0 4px 0" }}>
                      {selectedFile.name}
                    </p>
                    <p style={{ opacity: 0.6, margin: 0 }}>
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      setValidationResult(null);
                    }}
                  >
                    Remover arquivo
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <Upload
                    className="w-12 h-12"
                    style={{ color: "var(--sn-input-border)", opacity: 0.5 }}
                  />
                  <div>
                    <p style={{ margin: "0 0 4px 0" }}>
                      Clique para selecionar um arquivo PDF
                    </p>
                    <p style={{ opacity: 0.6, margin: 0 }}>
                      ou arraste e solte aqui
                    </p>
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isLoading}
              className="w-full"
              style={{
                backgroundColor: isLoading 
                  ? "var(--sn-input-border)" 
                  : "var(--sn-btn-primary-bg)",
                color: "var(--sn-btn-primary-text)",
                cursor: (!selectedFile || isLoading) ? "not-allowed" : "pointer",
              }}
              onMouseEnter={(e) => {
                if (!isLoading && selectedFile) {
                  e.currentTarget.style.backgroundColor =
                    "var(--sn-btn-primary-bg-hover)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading && selectedFile) {
                  e.currentTarget.style.backgroundColor =
                    "var(--sn-btn-primary-bg)";
                }
              }}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processando PDF...</span>
                </div>
              ) : (
                "Enviar PDF"
              )}
            </Button>
          </div>
        </Card>

        {/* Preview/Info Section */}
        <Card
          className="p-6"
          style={{ backgroundColor: "var(--sn-form-bg)" }}
        >
          <div className="space-y-4">
            <div>
              <h3 style={{ margin: "0 0 8px 0" }}>
                Informações
              </h3>
            </div>
            <div
              className="h-[400px] flex items-center justify-center rounded border-2 border-dashed"
              style={{
                borderColor: "var(--sn-input-border)",
              }}
            >
              {isLoading ? (
                <div className="flex flex-col items-center gap-4">
                  <Loader2 
                    className="w-12 h-12 animate-spin" 
                    style={{ color: "var(--sn-primary)" }}
                  />
                  <p style={{ opacity: 0.7, textAlign: "center" }}>
                    Processando PDF e extraindo informações...
                  </p>
                  <p style={{ opacity: 0.5, textAlign: "center" }}>
                    Isso pode levar alguns segundos
                  </p>
                </div>
              ) : validationResult ? (
                <div className="w-full h-full overflow-auto p-4">
                  <h4 style={{ margin: "0 0 12px 0" }}>
                    Campos Obrigatórios
                  </h4>
                  <div className="space-y-2">
                    {requiredFields.map((field) => {
                      const isPresent = validationResult.presentFields.includes(field);
                      return (
                        <div
                          key={field}
                          className="flex items-center gap-2 p-2 rounded"
                          style={{
                            backgroundColor: isPresent
                              ? "rgba(40, 167, 69, 0.1)"
                              : "rgba(220, 53, 69, 0.1)",
                          }}
                        >
                          {isPresent ? (
                            <CheckCircle
                              className="w-4 h-4"
                              style={{ color: "var(--sn-success)" }}
                            />
                          ) : (
                            <XCircleIcon
                              className="w-4 h-4"
                              style={{ color: "var(--sn-danger)" }}
                            />
                          )}
                          <code
                            style={{
                              fontFamily: "var(--sn-font-family-mono)",
                              fontSize: "0.85em",
                            }}
                          >
                            {fieldDisplayMapping[field] || field}
                          </code>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p style={{ opacity: 0.5, textAlign: "center", padding: "0 20px" }}>
                  Selecione um PDF e clique em 'Enviar PDF' para extrair informações
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Result Section - Full Width Below */}
      {validationResult && (
        <Card
          className="p-6 mt-6"
          style={{ backgroundColor: "var(--sn-form-bg)" }}
        >
          <div className="space-y-4">
            <div>
              <h3 style={{ margin: "0 0 8px 0" }}>
                Resultado da Validação
              </h3>
            </div>

            {/* Status Badge */}
            {validationResult.status !== "idle" && (
              <div
                className="p-4 rounded flex items-center gap-3"
                style={{
                  backgroundColor: getStatusConfig(
                    validationResult.status,
                  )?.bgColor,
                  border: `1px solid ${getStatusConfig(validationResult.status)?.color}`,
                }}
              >
                <div
                  style={{
                    color: getStatusConfig(
                      validationResult.status,
                    )?.color,
                  }}
                >
                  {
                    getStatusConfig(validationResult.status)
                      ?.icon
                  }
                </div>
                <div className="flex-1">
                  <div
                    style={{
                      color: getStatusConfig(
                        validationResult.status,
                      )?.color,
                    }}
                  >
                    {
                      getStatusConfig(
                        validationResult.status,
                      )?.label
                    }
                  </div>
                  <p
                    style={{
                      margin: "4px 0 0 0",
                      opacity: 0.9,
                    }}
                  >
                    {validationResult.message}
                  </p>
                </div>
              </div>
            )}

            {/* Fields Status - Data Table */}
            <div className="space-y-3">
              <div>
                <h4 style={{ margin: "0 0 12px 0" }}>
                  Dados Extraídos
                </h4>
                <div
                  className="rounded-lg border overflow-hidden"
                  style={{
                    borderColor: "var(--sn-input-border)",
                    backgroundColor:
                      "var(--sn-background-alt)",
                  }}
                >
                  <Table>
                    <TableHeader>
                      <TableRow
                        style={{
                          backgroundColor:
                            "var(--sn-background-dark)",
                        }}
                      >
                        <TableHead
                          style={{ width: "40px" }}
                        >
                          Status
                        </TableHead>
                        <TableHead>Campo</TableHead>
                        <TableHead>
                          Valor Extraído
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requiredFields.map((fieldSpec) => {
                        const isPresent =
                          validationResult.presentFields.includes(
                            fieldSpec,
                          );

                        const alternatives =
                          fieldSpec.split("|");
                        let value: any = undefined;
                        let actualField = alternatives[0];

                        for (const field of alternatives) {
                          const fieldValue = getNestedValue(
                            validationResult.extractedData,
                            field,
                          );
                          if (
                            fieldValue !== undefined &&
                            fieldValue !== null &&
                            fieldValue !== ""
                          ) {
                            value = fieldValue;
                            actualField = field;
                            break;
                          }
                        }

                        let displayValue: string;
                        if (
                          value === undefined ||
                          value === null ||
                          value === ""
                        ) {
                          displayValue = "—";
                        } else if (
                          typeof value === "object"
                        ) {
                          displayValue = JSON.stringify(
                            value,
                            null,
                            2,
                          );
                        } else {
                          displayValue = String(value);
                        }

                        // Map field names to display names
                        const mappedAlternatives = alternatives.map(
                          alt => fieldDisplayMapping[alt] || alt
                        );
                        const fieldDisplayName =
                          alternatives.length > 1
                            ? mappedAlternatives.join(" OR ")
                            : (fieldDisplayMapping[fieldSpec] || fieldSpec);

                        return (
                          <TableRow
                            key={fieldSpec}
                            style={{
                              backgroundColor: isPresent
                                ? "rgba(40, 167, 69, 0.05)"
                                : "rgba(220, 53, 69, 0.05)",
                            }}
                          >
                            <TableCell>
                              {isPresent ? (
                                <CheckCircle
                                  className="w-4 h-4"
                                  style={{
                                    color:
                                      "var(--sn-success)",
                                  }}
                                />
                              ) : (
                                <XCircleIcon
                                  className="w-4 h-4"
                                  style={{
                                    color:
                                      "var(--sn-danger)",
                                  }}
                                />
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                <code
                                  style={{
                                    fontFamily:
                                      "var(--sn-font-family-mono)",
                                    padding: "2px 6px",
                                    backgroundColor:
                                      "var(--sn-background-dark)",
                                    borderRadius:
                                      "var(--sn-border-radius)",
                                    fontSize: "0.85em",
                                  }}
                                >
                                  {fieldDisplayName}
                                </code>
                                {isPresent &&
                                  actualField &&
                                  alternatives.length >
                                    1 && (
                                    <span
                                      style={{
                                        fontSize: "0.75em",
                                        opacity: 0.6,
                                        fontFamily:
                                          "var(--sn-font-family-mono)",
                                      }}
                                    >
                                      Found: {actualField}
                                    </span>
                                  )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {typeof value === "object" &&
                              value !== null ? (
                                <pre
                                  style={{
                                    fontFamily:
                                      "var(--sn-font-family-mono)",
                                    color:
                                      "var(--sn-input-text)",
                                    margin: 0,
                                    whiteSpace: "pre-wrap",
                                    wordBreak: "break-word",
                                    fontSize: "0.85em",
                                  }}
                                >
                                  {displayValue}
                                </pre>
                              ) : (
                                <span
                                  style={{
                                    fontFamily: isPresent
                                      ? "var(--sn-font-family-mono)"
                                      : "inherit",
                                    color: isPresent
                                      ? "var(--sn-input-text)"
                                      : "var(--sn-danger)",
                                    opacity: isPresent
                                      ? 1
                                      : 0.6,
                                  }}
                                >
                                  {displayValue}
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Formatted JSON */}
              {validationResult.formattedJson && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 style={{ margin: 0 }}>
                      JSON Formatado
                    </h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyToClipboard}
                      className="gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      Copiar
                    </Button>
                  </div>
                  <pre
                    className="p-4 rounded overflow-auto max-h-[400px]"
                    style={{
                      backgroundColor: "#181826",
                      color: "#a6e22e",
                      fontFamily:
                        "var(--sn-font-family-mono)",
                      border:
                        "1px solid var(--sn-input-border)",
                    }}
                  >
                    {validationResult.formattedJson}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}
    </>
  );
}
