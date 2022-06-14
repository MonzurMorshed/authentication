import { PassportStrategy } from "@nestjs/passport";
import { ConfigService } from "nestjs-config";
import { ExtractJwt, Strategy } from "passport-jwt";

export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(configService: ConfigService){
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: 'mysecret'
        });
    }

    async validate(payload) {
        return { id: payload.sub, user: payload.email};
      }
}