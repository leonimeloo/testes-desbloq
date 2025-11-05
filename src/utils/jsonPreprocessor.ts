/**
 * JSON Preprocessor
 * Handles normalization, validation, and formatting of JSON data
 */

/**
 * Normalizes JSON string by removing extra spaces and invisible characters
 */
export function normalizeJsonString(jsonString: string): string {
  // Remove invisible characters (zero-width spaces, BOM, etc.)
  let normalized = jsonString.replace(/[\u200B-\u200D\uFEFF]/g, "");

  // Trim leading/trailing whitespace
  normalized = normalized.trim();

  return normalized;
}

/**
 * Validates and parses JSON string
 * Returns parsed object or throws error with helpful message
 */
export function parseAndValidateJson(jsonString: string): any {
  const normalized = normalizeJsonString(jsonString);

  if (!normalized) {
    throw new Error("JSON vazio - por favor, cole um JSON válido");
  }

  try {
    const parsed = JSON.parse(normalized);
    return parsed;
  } catch (error) {
    if (error instanceof SyntaxError) {
      // Try to provide more helpful error message
      const message = error.message;
      throw new Error(`JSON inválido: ${message}`);
    }
    throw error;
  }
}

/**
 * Converts snake_case string to Title Case
 * Examples:
 * - "leilao_publico" → "Leilão Público"
 * - "processo_administrativo" → "Processo Administrativo"
 * - "oficio_b3" → "Ofício B3"
 */
export function snakeCaseToTitleCase(text: string): string {
  if (!text || typeof text !== "string") return text;

  // Split by underscore
  const words = text.split("_");

  // Capitalize each word
  const titleCased = words.map((word) => {
    if (!word) return "";

    // Special handling for common abbreviations
    const upperWord = word.toLowerCase();
    if (upperWord === "b3") return "B3";
    if (upperWord === "cpf") return "CPF";
    if (upperWord === "cnpj") return "CNPJ";
    if (upperWord === "uf") return "UF";
    if (upperWord === "ocr") return "OCR";
    if (upperWord === "qa") return "QA";

    // Apply accents for common Portuguese words
    const accentMap: Record<string, string> = {
      leilao: "Leilão",
      publico: "Público",
      orgao: "Órgão",
      oficio: "Ofício",
      motivo: "Motivo",
      destinacao: "Destinação",
      validacao: "Validação",
      numero: "Número",
      processos: "Processos",
      administrativo: "Administrativo",
      administrativos: "Administrativos",
      veiculo: "Veículo",
      veiculos: "Veículos",
      solicitacao: "Solicitação",
      solicitante: "Solicitante",
      unidade: "Unidade",
    };

    if (accentMap[upperWord]) {
      return accentMap[upperWord];
    }

    // Default: capitalize first letter
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });

  return titleCased.join(" ");
}

/**
 * Recursively formats all string values in an object from snake_case to Title Case
 * Creates a deep copy to avoid mutating the original object
 */
export function formatObjectValues(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map((item) => formatObjectValues(item));
  }

  // Handle objects
  if (typeof obj === "object") {
    const formatted: any = {};

    for (const [key, value] of Object.entries(obj)) {
      // Format the value
      if (typeof value === "string") {
        // Check if it looks like snake_case (has underscores)
        if (value.includes("_")) {
          formatted[key] = snakeCaseToTitleCase(value);
        } else {
          formatted[key] = value;
        }
      } else if (typeof value === "object") {
        // Recursively format nested objects/arrays
        formatted[key] = formatObjectValues(value);
      } else {
        // Keep other types as-is (numbers, booleans, etc.)
        formatted[key] = value;
      }
    }

    return formatted;
  }

  // Return primitive values as-is
  return obj;
}

/**
 * Main preprocessing function
 * Returns both original and formatted versions of the data
 */
export interface PreprocessedData {
  original: any;
  formatted: any;
  normalizedString: string;
}

export function preprocessJson(jsonString: string): PreprocessedData {
  // Parse and validate
  const parsed = parseAndValidateJson(jsonString);

  // Create formatted version
  const formatted = formatObjectValues(parsed);

  // Get normalized string for display
  const normalizedString = JSON.stringify(parsed, null, 2);

  return {
    original: parsed,
    formatted: formatted,
    normalizedString: normalizedString,
  };
}
