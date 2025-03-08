import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoria } from './entities/categoria.entity';
import { CrearCategoriaDto } from './dtos/crear-categoria.dto';
import { ActualizarCategoriaDto } from './dtos/actualizar-categoria.dto';

@Injectable()
export class CategoriasService {
  constructor(
    @InjectRepository(Categoria)
    private readonly categoriaRepo: Repository<Categoria>,
  ) {}

  async obtenerCategorias(): Promise<Categoria[]> {
    return this.categoriaRepo.find({ relations: ['subcategorias'] });
  }

  async obtenerCategoria(id_cat: number): Promise<Categoria> {
    const categoria = await this.categoriaRepo.findOne({
      where: { id_cat },
      relations: ['subcategorias'],
    });
    if (!categoria) {
      throw new NotFoundException('Categoría no encontrada');
    }
    return categoria;
  }

  async registrarCategoria(data: CrearCategoriaDto): Promise<Categoria> {
    const nuevaCategoria = this.categoriaRepo.create(data);
    return this.categoriaRepo.save(nuevaCategoria);
  }

  async editarCategoria(
    id_cat: number,
    cambios: ActualizarCategoriaDto,
  ): Promise<Categoria> {
    await this.obtenerCategoria(id_cat);
    await this.categoriaRepo.update(id_cat, cambios);
    return this.obtenerCategoria(id_cat);
  }

  async eliminarCategoria(id_cat: number): Promise<void> {
    const resultado = await this.categoriaRepo.delete(id_cat);
    if (resultado.affected === 0) {
      throw new NotFoundException('Categoría no encontrada');
    }
  }
}
