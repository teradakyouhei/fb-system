// NextAuth.js認証設定
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        userId: { 
          label: 'ユーザーID', 
          type: 'text',
          placeholder: 'admin'
        },
        password: { 
          label: 'パスワード', 
          type: 'password',
          placeholder: '••••••••'
        }
      },
      async authorize(credentials) {
        if (!credentials?.userId || !credentials?.password) {
          throw new Error('ユーザーIDとパスワードを入力してください');
        }

        try {
          // データベースからユーザーを検索
          const user = await prisma.user.findFirst({
            where: {
              OR: [
                { userId: credentials.userId },
                { username: credentials.userId }
              ]
            },
            include: {
              staff: true
            }
          });

          if (!user) {
            throw new Error('ユーザーが見つかりません');
          }

          // パスワード検証
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          
          if (!isPasswordValid) {
            throw new Error('パスワードが正しくありません');
          }

          // 認証成功時の返却データ
          return {
            id: user.id,
            userId: user.userId,
            username: user.username,
            authority: user.authority,
            staffId: user.staffId,
            staffName: user.staff?.name || null,
            email: null // メール認証は使用しない
          };
        } catch (error: any) {
          console.error('認証エラー:', error);
          throw new Error(error.message || '認証に失敗しました');
        }
      }
    })
  ],
  
  pages: {
    signIn: '/login',
    error: '/login',
  },

  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24時間
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.userId;
        token.username = user.username;
        token.authority = user.authority;
        token.staffId = user.staffId;
        token.staffName = user.staffName;
      }
      return token;
    },
    
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub as string;
        session.user.userId = token.userId as string;
        session.user.username = token.username as string;
        session.user.authority = token.authority as string;
        session.user.staffId = token.staffId as string;
        session.user.staffName = token.staffName as string;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      // ログイン後のリダイレクト先
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/dashboard`;
    }
  },

  secret: process.env.NEXTAUTH_SECRET,

  debug: process.env.NODE_ENV === 'development',
};