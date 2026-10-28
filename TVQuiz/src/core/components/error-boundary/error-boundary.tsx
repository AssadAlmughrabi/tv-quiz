import { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
  /** Drawn instead of the children after a crash. `reset` tries the children again. */
  renderFallback: (reset: () => void) => ReactNode;
  children: ReactNode;
}

interface ErrorBoundaryState {
  failed: boolean;
}

/** Stops a crash in one part of the screen from taking down the whole app. */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true };
  }

  reset = () => this.setState({ failed: false });

  render() {
    return this.state.failed
      ? this.props.renderFallback(this.reset)
      : this.props.children;
  }
}
