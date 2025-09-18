import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { isValidObjectId } from 'mongoose';

@Injectable()
export class ParseMongoIdPipe implements PipeTransform {
  transform(value: string, metadata: ArgumentMetadata) {
    
    if(!isValidObjectId(value)) {
      throw new Error(`The id ${value} is not a valid MongoId`);
    }

    return value.toUpperCase();
    
  }
}
