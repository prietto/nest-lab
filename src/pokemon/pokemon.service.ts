import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, Query } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { isValidObjectId, Model } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';
import { PaginationDto } from 'src/common/dto/pagination-dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PokemonService {

  private defaultLimit: number;

  constructor(

    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly configService: ConfigService
  ){

    this.defaultLimit = this.configService.get<number>('defaultLimit') ?? 5;

  }

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();
    
    try {
      const pokemon = await this.pokemonModel.create( createPokemonDto );
      return pokemon;
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = this.defaultLimit, offset = 0 } = paginationDto;

    return this.pokemonModel.find()
      .limit(limit)
      .skip(offset)
      .sort({
        no: 'asc' 
      });
  }

  async findOne(term: string) {
    let pokemon: Pokemon | null = null;

    // MongoID
    if(isValidObjectId(term)){
      pokemon = await this.pokemonModel.findById(term);
    }

    // No
    if(!isNaN(+term)){
      pokemon = await this.pokemonModel.findOne({ no: term });
    }

    // Name
    if(!pokemon){
      pokemon = await this.pokemonModel.findOne({ name: term.toLowerCase().trim() });
    }


    if(!pokemon) throw new NotFoundException(`Pokemon with id ${term} not found`);
    return pokemon;
  }




  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(term);

    if(updatePokemonDto.name)    
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase();

    try {
      await pokemon.updateOne(updatePokemonDto);
      const updatedPokemon = { ...pokemon.toJSON(), ...updatePokemonDto };
      return updatedPokemon;
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async remove(term: string) {
     const { deletedCount } = await this.pokemonModel.deleteOne({ _id: term });
    if( deletedCount === 0 )
      throw new BadRequestException(`Pokemon with id ${term} not found`);

    return;

    
  }



  private handleExceptions( error: any ){
    if(error.code === 11000){
      throw new BadRequestException(`Pokemon exists in db ${ JSON.stringify( error.keyValue ) }`);
    }
    throw new InternalServerErrorException(`Can't update Pokemon - Check server logs`);
  }

}
