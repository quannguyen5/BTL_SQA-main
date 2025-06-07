import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseBooleanPipe implements PipeTransform<string | undefined, boolean | undefined> {
    transform(value: string): boolean {
        if (value === undefined) return undefined;
        if (value === 'true') return true;
        if (value === 'false') return false;
        throw new BadRequestException(`Validation failed: ${value} is not a boolean`);
    }
}