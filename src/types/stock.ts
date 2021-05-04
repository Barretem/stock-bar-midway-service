import { IResponse } from './base';

export interface IStock extends IResponse {
  data: Array<{
    code: string;
    name: string;
    open: string;
    yestclose: string;
    price: string;
    low: string;
    high: string;
    volume: string;
    amount: string;
    time: string;
    percent: string;
    showLabel: string;
    isStock: boolean;
    type: string;
    symbol: string;
    updown: string;
  }>;
}
