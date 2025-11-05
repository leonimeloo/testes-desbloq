# Exemplos de JSON para Validação

## Documento Comprobatório

### ✓ Exemplo Válido

```json
{
  "doc_type": "documento_comprobatorio",
  "processo_administrativo": "12345.678901/2024-01",
  "processos_administrativos": ["12345.678901/2024-01"],
  "validation": "success"
}
```

### ✗ Exemplo com Formato Inválido

```json
{
  "doc_type": "documento_comprobatorio",
  "processo_administrativo": "12345-678901/2024",
  "processos_administrativos": ["12345-678901/2024"],
  "validation": "error"
}
```

**Problemas:**
- Formato incorreto: usa hífen (-) em vez de ponto (.)
- Falta o sufixo "-DD" no final

### ✗ Exemplo com Campo Ausente

```json
{
  "doc_type": "documento_comprobatorio",
  "processos_administrativos": [],
  "validation": "pending"
}
```

**Problema:**
- Campo `processo_administrativo` ausente

## Formato Esperado

O processo administrativo deve seguir este padrão:

```
XXXXX.XXXXXX/YYYY-DD
```

Onde:
- **XXXXX**: 5 dígitos
- **XXXXXX**: 6 dígitos
- **YYYY**: 4 dígitos (ano)
- **DD**: 2 dígitos

**Exemplos válidos:**
- `12345.678901/2024-01`
- `98765.432109/2023-15`
- `00001.000001/2025-99`

**Exemplos inválidos:**
- `1234.678901/2024-01` (4 dígitos em vez de 5 no início)
- `12345.67890/2024-01` (5 dígitos em vez de 6 no meio)
- `12345.678901/24-01` (ano com 2 dígitos em vez de 4)
- `12345.678901/2024-1` (1 dígito em vez de 2 no final)
- `12345-678901/2024-01` (hífen em vez de ponto)
- `12345.678901-2024-01` (hífen em vez de barra)

## Ofício B3

### ✓ Exemplo Válido

```json
{
  "doc_type": "oficio_b3",
  "oficio": {
    "assunto": "solicitacao_baixa_restricao",
    "destinatario": "b3_sa",
    "solicitacao": "Solicito a baixa de restrição",
    "motivo": "leilao_publico",
    "destinacao": "venda_judicial",
    "veiculos": [
      {
        "placa": "ABC1234",
        "chassi": "9BWZZZ377VT004251",
        "renavam": "12345678901",
        "uf": "SP"
      }
    ],
    "solicitante": {
      "orgao": "policia_federal",
      "unidade": "delegacia_federal_sao_paulo"
    }
  }
}
```

### Validações do Ofício B3

1. **Direcionamento à B3**: Verifica se o destinatário é "b3" ou "b3_sa"
2. **Solicitação**: Verifica se o campo "solicitacao" está preenchido
3. **Motivo e Destinação**: Verifica se "motivo" e "destinacao" estão presentes
4. **Dados do Veículo**: Valida placa, chassi e UF (renavam é opcional)
5. **Solicitante**: Verifica se "orgao" e "unidade" estão preenchidos
