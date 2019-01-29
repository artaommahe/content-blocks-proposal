import { BaseBlockApi } from '../../base/service/block-api';
import { TOrderWordValue, TOrderWordAnswer } from '../interface';
import { OrderWordModel } from './model';

export class OrderWordBlockApi extends BaseBlockApi<TOrderWordValue, TOrderWordAnswer, OrderWordModel> {
}
