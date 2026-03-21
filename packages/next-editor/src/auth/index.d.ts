export declare const GET: (request: Request) => Promise<Response>;
export declare const POST: (request: Request) => Promise<Response>;

export declare const auth: (...args: any[]) => Promise<any>;
export declare const signIn: (...args: any[]) => Promise<any>;
export declare const signOut: (...args: any[]) => Promise<any>;
