import { Inject, Injectable, Logger, RequestTimeoutException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { compareSync } from 'bcryptjs';
import { catchError, throwError, timeout, TimeoutError } from 'rxjs';

@Injectable()
export class AuthService {
    constructor(
        @Inject('USER_CLIENT')
        private readonly client: ClientProxy,
        private readonly jwtService: JwtService
    ){}

    async valdateUser(email: string, password: string): Promise<any> {
        try{
            const user = await this.client.send({role: 'user', cmd: 'get'},{email}
                    ).pipe(
                        timeout(5000),
                        catchError(err => {
                            if(err instanceof TimeoutError){
                                return throwError(new RequestTimeoutException());
                            }
                            return throwError(err);
                        }),
                    ).toPromise();

            if(compareSync(password, user?.password)){
                return user;
            }

        } catch(e) {
          Logger.log(e);
          throw e;
        }
        
            
    }

    async login(user) {
        const payload = { user, sub: user.id};
    
        return {
          userId: user.id,
          accessToken: this.jwtService.sign(payload)
        };
    }
}
