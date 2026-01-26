import { ComponentExample } from "./components/example/component-example.tsx";
import { ThemeProvider } from "./contexts/theme-provider.tsx";

export function App() {
  return (
    <ThemeProvider>
      <ComponentExample />
    </ThemeProvider>
  );
}
