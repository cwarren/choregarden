// Extend Request type to include user data
declare global {
  namespace Express {
    interface Request {
      user?: {
        cognitoUserId: string;
        email: string;
        appUser: any; // Your application user from database
      };
    }
  }
}

export {};
