import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';
import { Cart } from '../models';
import {dbSettings} from "../dbSettings";
import {Client as PgClient} from 'pg';

@Injectable()
export class CartService {
  private userCarts: Record<string, Cart> = {};

  // @todo: https://github.com/DimDev/aws-js-course-backend/pull/6/files#diff-a4ade257c4fcc22de0e83155d2e2a96cbdbeb2de2094edf1f0fc09846ab10578
  // @todo: https://github.com/driverok/cloudx-nodejs-backend/pull/7/files#diff-a4ade257c4fcc22de0e83155d2e2a96cbdbeb2de2094edf1f0fc09846ab10578

  findByUserId(userId: string): Cart {
    const pgClient = new PgClient(dbSettings);

    return this.userCarts[ userId ];
  }

  createByUserId(userId: string) {
    const id = v4(v4());
    const userCart = {
      id,
      items: [],
    };

    this.userCarts[ userId ] = userCart;

    return userCart;
  }

  findOrCreateByUserId(userId: string): Cart {
    const userCart = this.findByUserId(userId);

    if (userCart) {
      return userCart;
    }

    return this.createByUserId(userId);
  }

  updateByUserId(userId: string, { items }: Cart): Cart {
    const { id, ...rest } = this.findOrCreateByUserId(userId);

    const updatedCart = {
      id,
      ...rest,
      items: [ ...items ],
    }

    this.userCarts[ userId ] = { ...updatedCart };

    return { ...updatedCart };
  }

  removeByUserId(userId): void {
    this.userCarts[ userId ] = null;
  }

}
