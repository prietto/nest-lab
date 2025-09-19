import { Injectable } from '@nestjs/common';
import axios from 'axios';  
import { PokeResponse } from './interfaces/poke-response-interface';
import { AxiosInstance } from 'axios';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from '../pokemon/entities/pokemon.entity';
import { Model } from 'mongoose';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';



@Injectable()
export class SeedService {

  constructor(
    @InjectModel(Pokemon.name)
    private readonly PokemonModel: Model<Pokemon>,
    private readonly axiosAdapter: AxiosAdapter 
  ){} 



  async executeSeedV1(){

    await this.PokemonModel.deleteMany({});

    const data = await this.axiosAdapter.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=10'); 
    const insertPromises:Array<Promise<any>> = [];    

    data.results.forEach( ({name, url}) => {
      const segments = url.split('/');
      const no:number = +segments[segments.length - 2];
      console.log({name, no});

      //this.PokemonModel.create({name,no})
      insertPromises.push(
        this.PokemonModel.create({name,no})
      );
    });

    const newArray: Pokemon[] = await Promise.all( insertPromises );
    return 'Seed executed';
  }



  async executeSeed(){

    await this.PokemonModel.deleteMany({});
    const data = await this.axiosAdapter.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=650'); 
    const pokemonToInsert: {name:string, no:number}[] = [];
    

    data.results.forEach( ({name, url}) => {
      const segments = url.split('/');
      const no:number = +segments[segments.length - 2];
      console.log({name, no});
      pokemonToInsert.push({name, no});
    });

    await this.PokemonModel.insertMany(pokemonToInsert);
    return 'Seed executed';
  }

}
