// NextAuth.js型定義拡張
import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      userId: string;
      username: string;
      authority: string;
      staffId: string | null;
      staffName: string | null;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    userId: string;
    username: string;
    authority: string;
    staffId: string | null;
    staffName: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId: string;
    username: string;
    authority: string;
    staffId: string | null;
    staffName: string | null;
  }
}