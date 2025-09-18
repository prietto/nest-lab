import { IsInt, IsPositive, IsString, Min, MinLength } from "class-validator";

export class CreatePokemonDto {

    @IsInt()
    @Min(1)
    @IsPositive()
    readonly no: number;

    @IsString()
    @MinLength(3)
    name: string;
}
