import { ValidationPanel } from "./components/ValidationPanel";
import { DesbloqueioPanel } from "./components/DesbloqueioPanel";
import {
  CustomTabs,
  CustomTabsList,
  CustomTabsTrigger,
  CustomTabsContent,
} from "./components/CustomTabs";
// Baixa supports two formats:
// 1. Flat format: { doc_type, processo_administrativo, processos_administrativos, validation }
// 2. Nested format: { doc_type: "oficio_b3", oficio: { ... } }
const baixaFields = [
  "doc_type",
  "processo_administrativo|oficio.solicitante",
  "processos_administrativos|oficio.veiculos",
  "validation|oficio.assunto",
];

export default function App() {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--sn-background)" }}
    >
      {/* Header */}
      <div
        className="border-b"
        style={{
          backgroundColor: "#181826",
          borderColor: "var(--sn-primary-dark)",
        }}
      >
        <div className="container mx-auto px-4 py-4">
          <h1
            style={{
              color: "var(--sn-primary-foreground)",
              margin: 0,
            }}
          >
            Ferramenta de Testes OCR
          </h1>
          <p
            style={{
              color: "var(--sn-primary-foreground)",
              opacity: 0.8,
              margin: "4px 0 0 0",
            }}
          >
            Validação de resultados OCR - QA Tool • Pré-processamento automático com formatação snake_case → Title Case
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <CustomTabs defaultValue="desbloqueio" className="w-full">
          <CustomTabsList>
            <CustomTabsTrigger value="desbloqueio">
              Desbloqueio
            </CustomTabsTrigger>
            <CustomTabsTrigger value="baixa">Baixa</CustomTabsTrigger>
          </CustomTabsList>

          <CustomTabsContent value="desbloqueio">
            <DesbloqueioPanel />
          </CustomTabsContent>

          <CustomTabsContent value="baixa">
            <ValidationPanel
              requiredFields={baixaFields}
              placeholder='{"doc_type": "oficio_b3", "oficio": {"assunto": "...", "veiculos": [...], ...}} ou {"doc_type": "documento_comprobatorio", "processo_administrativo": "...", ...}'
              title="Baixa"
            />
          </CustomTabsContent>
        </CustomTabs>
      </div>
    </div>
  );
}