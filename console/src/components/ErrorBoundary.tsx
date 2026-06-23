import { Component, type ErrorInfo, type ReactNode } from 'react'
import { ErrorState } from './states/ErrorState'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-canvas p-8">
          <div className="w-full max-w-md">
            <ErrorState
              title="The console hit an unexpected error"
              error={this.state.error}
              onRetry={() => {
                this.setState({ error: null })
                window.location.reload()
              }}
            />
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
