import { Inject, Injectable, Logger, RequestTimeoutException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { compareSync } from 'bcrypt';
import { throwError, TimeoutError } from 'rxjs';

@Injectable()
export class AuthService {
    constructor(
        @Inject('USER_CLIENT')
        private readonly client: ClientProxy,
        private readonly jwtService: JwtService
    ){}

    async valdateUser(email: string, password: string): Promise<any> {
        try{
            const user = await this.client.send({
                    role: 'user',
                    cmd: 'get'
                },
                {email}
            ).pipe(
                timeout(5000),
                catchError(err => {
                    if(err instanceof TimeoutError){
                        return throwError(new RequestTimeoutException);
                    }
                }),
            ).toPromise();

            if(compareSync(password, email?.password)){
                return email;
            }

        }   catch(e) {
            Logger.log(e);
            throw e;
        }
        
            
    }

    async login(email) {
        const payload = { email, sub: email.id};
    
        return {
          userId: email.id,
          accessToken: this.jwtService.sign(payload)
        };
      }
}
