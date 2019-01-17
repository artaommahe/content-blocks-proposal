import { IBlockAnswer } from '../base/model/interface';
import { TemplateRef } from '@angular/core';

export type TOrderWordValue = string[];
export type TOrderWordAnswer = IBlockAnswer<TOrderWordValue>;

export interface IOrderWordItem {
  id: string;
  text: string;
  templateRef: TemplateRef<any>;
}

export interface IOrderWordFormattedItem extends IOrderWordItem {
  isCorrect: boolean | null;
}
