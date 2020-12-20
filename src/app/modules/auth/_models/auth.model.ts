export class AuthModel {
  id: number;
  userData: any;
  authorizedBy: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: Date;
}
