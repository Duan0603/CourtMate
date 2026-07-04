import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../infrastructure/persistence/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findByCity(city: string): Promise<User[]> {
    return this.userModel.find({ 'preferences.location': city }).exec();
  }

  async findByRole(role: string): Promise<User[]> {
    return this.userModel.find({ role }).exec();
  }

  async findAdminsByCity(city: string): Promise<User[]> {
    return this.userModel
      .find({ role: 'REGIONAL_ADMIN', 'preferences.location': city })
      .exec();
  }

  async countByCity(city: string): Promise<number> {
    return this.userModel.countDocuments({ 'preferences.location': city }).exec();
  }
}
