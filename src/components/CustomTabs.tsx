import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs@1.1.3";

interface CustomTabsProps {
  defaultValue: string;
  children: React.ReactNode;
  className?: string;
}

interface CustomTabsTriggerProps {
  value: string;
  children: React.ReactNode;
}

const CustomTabsContext = React.createContext<{
  activeTab: string;
  setActiveTab: (value: string) => void;
}>({
  activeTab: "",
  setActiveTab: () => {},
});

export function CustomTabs({ defaultValue, children, className }: CustomTabsProps) {
  const [activeTab, setActiveTab] = React.useState(defaultValue);

  return (
    <CustomTabsContext.Provider value={{ activeTab, setActiveTab }}>
      <TabsPrimitive.Root
        value={activeTab}
        onValueChange={setActiveTab}
        className={className}
      >
        {children}
      </TabsPrimitive.Root>
    </CustomTabsContext.Provider>
  );
}

export function CustomTabsList({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mb-6">
      {/* Bottom Divider */}
      <div
        className="absolute bottom-0 h-px left-0 right-0"
        style={{ backgroundColor: "#b0b5bf" }}
      />
      {/* Tab List */}
      <TabsPrimitive.List className="bg-transparent h-auto p-0 flex items-start w-full justify-start gap-0">
        {children}
      </TabsPrimitive.List>
    </div>
  );
}

export function CustomTabsTrigger({ value, children }: CustomTabsTriggerProps) {
  const { activeTab } = React.useContext(CustomTabsContext);
  const isActive = activeTab === value;

  return (
    <TabsPrimitive.Trigger
      value={value}
      className="relative flex items-center justify-center min-h-[32px] cursor-pointer bg-transparent border-0 rounded-none px-0 py-0 h-auto flex-none"
      style={{
        fontFamily: "var(--font-lato)",
        color: isActive ? "#007B58" : "var(--foreground)",
      }}
    >
      <div className="h-px shrink-0 w-[16px]" />
      <div className="box-border flex gap-[2px] items-center justify-center pb-[8px] pt-[5px] px-0">
        <div
          className="flex flex-col justify-center leading-[0] not-italic text-center text-nowrap"
          style={{
            fontFamily: "var(--font-lato)",
            fontSize: "var(--text-base)",
          }}
        >
          {children}
        </div>
      </div>
      <div className="h-px shrink-0 w-[16px]" />
      {/* Active Border */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 h-[2px]"
        style={{
          backgroundColor: "#007B58",
          opacity: isActive ? 1 : 0,
        }}
      />
    </TabsPrimitive.Trigger>
  );
}

export function CustomTabsContent({
  value,
  children,
}: {
  value: string;
  children: React.ReactNode;
}) {
  return (
    <TabsPrimitive.Content value={value} className="flex-1 outline-none">
      {children}
    </TabsPrimitive.Content>
  );
}
