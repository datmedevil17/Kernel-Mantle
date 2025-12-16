export interface Component {
  id: string;
  type: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  category: string;
  description: string;
  gasEstimate?: number;
  originalId?: string;
  x?: number;
  y?: number;
  properties: {
    [key: string]: any;
  };
}

export interface SecurityIssue {
  type: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
}

export interface GasEstimates {
  deployment?: number;
  functions?: number;
  storage?: number;
}

export interface Connection {
  from: string;
  to: string;
}

export interface CanvasState {
  canvasComponents: Component[];
  connections: Connection[];
  timestamp: number;
}