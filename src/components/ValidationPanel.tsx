import { useState } from "react";
import {
  Copy,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  CheckCircle,
  XCircle as XCircleIcon,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Textarea } from "./ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { toast } from "sonner@2.0.3";
import { OficioB3Validation } from "./OficioB3Validation";
import { DocumentoComprobatorioValidation } from "./DocumentoComprobatorioValidation";
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

interface ValidationPanelProps {
  requiredFields: string[];
  placeholder: string;
  title: string;
}

export function ValidationPanel({
  requiredFields,
  placeholder,
  title,
}: ValidationPanelProps) {
  const [jsonInput, setJsonInput] = useState("");
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);

  // Helper function to get nested value from object using path
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

  // Helper function to check if a field (or any of its alternatives) is present
  const isFieldPresent = (
    parsed: any,
    fieldSpec: string,
  ): boolean => {
    // Field spec can be "field1|field2|field3" for alternatives (OR logic)
    const alternatives = fieldSpec.split("|");

    for (const field of alternatives) {
      const value = getNestedValue(parsed, field);

      // Check if value is present and not empty
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        // For arrays, check if not empty
        if (Array.isArray(value)) {
          if (value.length > 0) return true;
        } else {
          return true;
        }
      }
    }

    return false;
  };

  const validateJson = () => {
    if (!jsonInput.trim()) {
      setValidationResult({
        status: "error",
        message: "Por favor, cole um JSON para validar",
        missingFields: requiredFields,
        presentFields: [],
        formattedJson: "",
        extractedData: {},
      });
      toast.error("Por favor, cole um JSON para validar");
      return;
    }

    try {
      // Preprocess JSON: normalize, validate, and format
      const preprocessed = preprocessJson(jsonInput);
      
      // Use original data for validation
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

  const copyToClipboard = () => {
    if (validationResult?.formattedJson) {
      // Fallback method that works in all contexts
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

  // Check document type for specific validation display
  const isOficioB3 = validationResult?.extractedData?.doc_type === "oficio_b3";
  const isDocumentoComprobatorio = validationResult?.extractedData?.doc_type === "documento_comprobatorio";
  const hasSpecificValidation = isOficioB3 || isDocumentoComprobatorio;

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card
          className="p-6"
          style={{ backgroundColor: "var(--sn-form-bg)" }}
        >
          <div className="space-y-4">
            <div>
              <h3 style={{ margin: "0 0 8px 0" }}>
                Entrada de JSON
              </h3>
              <p style={{ opacity: 0.7, margin: "0 0 16px 0" }}>
                Cole o JSON retornado pelo OCR abaixo
              </p>
            </div>

            <Textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder={placeholder}
              className="min-h-[400px]"
              style={{
                backgroundColor: "var(--sn-input-bg)",
                borderColor: "var(--sn-input-border)",
                color: "var(--sn-input-text)",
                fontFamily: "var(--sn-font-family-mono)",
              }}
            />

            <Button
              onClick={validateJson}
              className="w-full"
              style={{
                backgroundColor: "var(--sn-btn-primary-bg)",
                color: "var(--sn-btn-primary-text)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  "var(--sn-btn-primary-bg-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor =
                  "var(--sn-btn-primary-bg)";
              }}
            >
              Validar JSON
            </Button>
          </div>
        </Card>

        {/* Specific Validation - Right Side */}
        {hasSpecificValidation && validationResult ? (
          <div style={{ height: "fit-content" }}>
            {isOficioB3 && (
              <OficioB3Validation data={validationResult.extractedData} />
            )}
            {isDocumentoComprobatorio && (
              <DocumentoComprobatorioValidation data={validationResult.extractedData} />
            )}
          </div>
        ) : (
          <Card
            className="p-6"
            style={{ backgroundColor: "var(--sn-form-bg)" }}
          >
            <div className="space-y-4">
              <div>
                <h3 style={{ margin: "0 0 8px 0" }}>
                  Validação Específica
                </h3>
              </div>
              <div
                className="h-[400px] flex items-center justify-center rounded border-2 border-dashed"
                style={{
                  borderColor: "var(--sn-input-border)",
                }}
              >
                <p style={{ opacity: 0.5, textAlign: "center", padding: "0 20px" }}>
                  {validationResult
                    ? "Validação específica disponível para documentos do tipo 'oficio_b3' ou 'documento_comprobatorio'"
                    : "Cole um JSON e clique em 'Validar JSON' para ver validações específicas"}
                </p>
              </div>
            </div>
          </Card>
        )}
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

                        // Get the actual value - try all alternatives
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

                        // Handle different types of values
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

                        // Display field name (show alternatives if any)
                        const fieldDisplayName =
                          alternatives.length > 1
                            ? alternatives.join(" OR ")
                            : fieldSpec;

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
