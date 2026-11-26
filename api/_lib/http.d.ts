type ApiRequest = {
    headers?: Record<string, string | string[] | undefined>;
    method?: string;
};
type ApiResponse = {
    end: () => void;
    json: (payload: unknown) => void;
    setHeader: (name: string, value: string | string[]) => void;
    status: (code: number) => ApiResponse;
};
type CookieOptions = {
    httpOnly?: boolean;
    maxAge?: number;
    path?: string;
    sameSite?: 'Lax' | 'Strict' | 'None';
    secure?: boolean;
};
export declare const applyCors: (req: ApiRequest, res: ApiResponse, methods?: string) => void;
export declare const noStore: (res: ApiResponse) => void;
export declare const json: (res: ApiResponse, statusCode: number, payload: unknown) => void;
export declare const redirect: (res: ApiResponse, statusCode: number, location: string, cookies?: string[]) => void;
export declare const methodNotAllowed: (res: ApiResponse) => void;
export declare const handleOptionsRequest: (res: ApiResponse) => void;
export declare const parseCookies: (cookieHeader: string | undefined) => Record<string, string>;
export declare const buildSetCookie: (name: string, value: string, options?: CookieOptions) => string;
export declare const getRequestOrigin: (req: ApiRequest) => string | undefined;
export declare const getCookieHeader: (req: ApiRequest) => string | undefined;
export declare const isSecureRequest: (req: ApiRequest) => boolean;
export {};
