import { Component, type ErrorInfo, type ReactNode } from "react";
import { Card } from "./ui/Card.js";
import { Button } from "./ui/Button.js";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[gdash error boundary]", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex min-h-[200px] items-center justify-center p-8">
          <Card className="max-w-md text-center">
            <p className="font-semibold text-[var(--status-error)]">Something went wrong</p>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              {this.state.error.message}
            </p>
            <Button
              variant="secondary"
              className="mt-4"
              onClick={() => this.setState({ error: null })}
            >
              Try again
            </Button>
          </Card>
        </div>
      );
    }
    return this.props.children;
  }
}
