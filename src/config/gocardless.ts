import { config } from './env';

// GoCardless client placeholder
// TODO: Install and configure the official GoCardless SDK when ready
// The official package may be: npm install gocardless-pro-node
// Or use the REST API directly with axios/fetch

export interface GoCardlessClient {
  customers: {
    create: (data: any) => Promise<any>;
  };
  redirectFlows: {
    create: (data: any) => Promise<any>;
  };
  payments: {
    create: (data: any) => Promise<any>;
  };
}

// Placeholder implementation - replace with actual GoCardless SDK
const createPlaceholderClient = (): GoCardlessClient => {
  return {
    customers: {
      create: async (data: any) => {
        // Placeholder - replace with actual GoCardless API call
        console.warn('GoCardless not configured - using placeholder');
        return { id: `customer_${Date.now()}` };
      },
    },
    redirectFlows: {
      create: async (data: any) => {
        console.warn('GoCardless not configured - using placeholder');
        return {
          id: `redirect_flow_${Date.now()}`,
          redirect_url: data.success_redirect_url || 'https://example.com',
        };
      },
    },
    payments: {
      create: async (data: any) => {
        console.warn('GoCardless not configured - using placeholder');
        return {
          id: `payment_${Date.now()}`,
          status: 'pending',
        };
      },
    },
  };
};

export const gocardlessClient = createPlaceholderClient();

export default gocardlessClient;

