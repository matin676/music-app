/**
 * ErrorBoundary Component
 *
 * Catches JavaScript errors in child components and displays
 * a fallback UI instead of crashing the whole app.
 */
import React from "react";
import { IoWarningOutline, IoRefreshOutline } from "react-icons/io5";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // TODO: Log error to monitoring service (e.g., Sentry) in production
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <div className="error-boundary-icon">
              <IoWarningOutline />
            </div>
            <h2 className="error-boundary-title">Something went wrong</h2>
            <p className="error-boundary-message">
              {this.props.message || "We encountered an unexpected error."}
            </p>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <pre className="error-boundary-details">
                {this.state.error.toString()}
              </pre>
            )}
            <button
              className="error-boundary-button"
              onClick={this.handleRetry}
            >
              <IoRefreshOutline />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
