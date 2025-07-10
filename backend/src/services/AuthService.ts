import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

// Configuration interface for Cognito settings
export interface CognitoConfig {
  awsRegion: string;
  userPoolId: string;
  clientId: string;
}

// Decoded JWT token interface
export interface DecodedToken {
  sub: string;
  email: string;
  name?: string;
  'cognito:username'?: string;
  aud: string;
  exp: number;
  iat: number;
}

// User info extracted from token
export interface TokenUserInfo {
  cognitoUserId: string;
  email: string;
}

export class AuthService {
  private jwksClients: Map<string, jwksClient.JwksClient> = new Map();

  constructor(private cognitoConfig: CognitoConfig) {}

  /**
   * Create or get cached JWKS client for the configured Cognito user pool
   */
  private getJwksClient(): jwksClient.JwksClient {
    const key = this.cognitoConfig.userPoolId;
    
    if (!this.jwksClients.has(key)) {
      const client = jwksClient({
        jwksUri: `https://cognito-idp.${this.cognitoConfig.awsRegion}.amazonaws.com/${this.cognitoConfig.userPoolId}/.well-known/jwks.json`
      });
      this.jwksClients.set(key, client);
    }
    
    return this.jwksClients.get(key)!;
  }

  /**
   * Get signing key for JWT verification
   */
  private getSigningKey(client: jwksClient.JwksClient) {
    return (header: any, callback: (err: any, key?: string) => void) => {
      client.getSigningKey(header.kid, (err: any, key: any) => {
        const signingKey = key?.getPublicKey();
        callback(null, signingKey);
      });
    };
  }

  /**
   * Validate a Cognito JWT token with full JWKS verification
   */
  async validateCognitoToken(token: string): Promise<DecodedToken> {
    const client = this.getJwksClient();
    const getKeyFunction = this.getSigningKey(client);

    return new Promise((resolve, reject) => {
      jwt.verify(token, getKeyFunction, {
        audience: this.cognitoConfig.clientId,
        issuer: `https://cognito-idp.${this.cognitoConfig.awsRegion}.amazonaws.com/${this.cognitoConfig.userPoolId}`,
        algorithms: ['RS256']
      }, (err: any, decoded: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(decoded as DecodedToken);
        }
      });
    });
  }

  /**
   * Extract user info from a JWT token payload (without validation)
   * Use this when the token has already been validated (e.g., by API Gateway)
   */
  extractUserInfoFromToken(token: string): TokenUserInfo {
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      return {
        cognitoUserId: payload.sub,
        email: payload.email
      };
    } catch (error) {
      throw new Error('Invalid JWT token format');
    }
  }

  /**
   * Extract user info from a decoded token object
   */
  extractUserInfoFromDecodedToken(decoded: DecodedToken): TokenUserInfo {
    return {
      cognitoUserId: decoded.sub,
      email: decoded.email
    };
  }
}
