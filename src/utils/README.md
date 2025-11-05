# JSON Preprocessor

Camada de pré-processamento de JSON com normalização e formatação automática.

## Funcionalidades

### 1. Normalização de JSON

**`normalizeJsonString(jsonString: string): string`**

- Remove caracteres invisíveis (zero-width spaces, BOM, etc.)
- Remove espaços em branco desnecessários
- Prepara string para parsing seguro

**Exemplo:**
```typescript
const raw = "  \uFEFF{\"key\": \"value\"}  ";
const normalized = normalizeJsonString(raw);
// Result: "{\"key\": \"value\"}"
```

### 2. Validação e Parsing

**`parseAndValidateJson(jsonString: string): any`**

- Valida sintaxe JSON
- Fornece mensagens de erro detalhadas
- Lança exceções informativas para erros de parsing

**Exemplo:**
```typescript
try {
  const data = parseAndValidateJson('{"valid": "json"}');
} catch (error) {
  console.error(error.message); // "JSON inválido: ..."
}
```

### 3. Conversão snake_case → Title Case

**`snakeCaseToTitleCase(text: string): string`**

Converte strings em snake_case para formato legível com acentuação correta.

**Características:**
- Suporte a acentuação portuguesa
- Preserva abreviações comuns (B3, CPF, CNPJ, UF, etc.)
- Capitalização inteligente de palavras

**Exemplos:**
```typescript
snakeCaseToTitleCase("leilao_publico")      // → "Leilão Público"
snakeCaseToTitleCase("processo_administrativo") // → "Processo Administrativo"
snakeCaseToTitleCase("oficio_b3")          // → "Ofício B3"
snakeCaseToTitleCase("numero_cpf")         // → "Número CPF"
```

**Dicionário de acentuação:**
- leilao → Leilão
- publico → Público
- orgao → Órgão
- oficio → Ofício
- motivo → Motivo
- destinacao → Destinação
- validacao → Validação
- numero → Número
- veiculo/veiculos → Veículo/Veículos
- solicitacao → Solicitação
- administrativo/administrativos → Administrativo/Administrativos

### 4. Formatação Recursiva de Objetos

**`formatObjectValues(obj: any): any`**

Aplica formatação snake_case → Title Case recursivamente em todos os valores string de um objeto.

**Características:**
- Preserva estrutura original do objeto
- Cria deep copy (não muta objeto original)
- Suporta arrays e objetos aninhados
- Mantém tipos primitivos (números, booleans)

**Exemplo:**
```typescript
const original = {
  tipo: "leilao_publico",
  dados: {
    orgao: "policia_federal",
    veiculos: [
      { status: "disponivel_para_leilao" }
    ]
  }
};

const formatted = formatObjectValues(original);
// Result:
// {
//   tipo: "Leilão Público",
//   dados: {
//     orgao: "Policia Federal",
//     veiculos: [
//       { status: "Disponível Para Leilão" }
//     ]
//   }
// }
```

### 5. Pré-processamento Completo

**`preprocessJson(jsonString: string): PreprocessedData`**

Função principal que combina todas as etapas de pré-processamento.

**Retorna:**
```typescript
interface PreprocessedData {
  original: any;           // Dados originais (para validação)
  formatted: any;          // Dados formatados (para exibição)
  normalizedString: string; // JSON formatado como string
}
```

**Exemplo de uso:**
```typescript
const jsonInput = '{"doc_type": "oficio_b3", "motivo": "leilao_publico"}';

const result = preprocessJson(jsonInput);

console.log(result.original.motivo);  // "leilao_publico" (original)
console.log(result.formatted.motivo); // "Leilão Público" (formatado)
console.log(result.normalizedString); // JSON formatado com indentação
```

## Integração

O pré-processador está integrado em:

- **ValidationPanel.tsx**: Valida e formata JSON antes de processar
- **OficioB3Validation.tsx**: Usa formatação para exibir valores legíveis

## Tratamento de Erros

Todos os erros são capturados e convertidos em mensagens amigáveis:

```typescript
try {
  const result = preprocessJson(invalidJson);
} catch (error) {
  // Error messages:
  // - "JSON vazio - por favor, cole um JSON válido"
  // - "JSON inválido: Unexpected token..."
  toast.error(error.message);
}
```
