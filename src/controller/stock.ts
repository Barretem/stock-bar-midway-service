import { Inject, Controller, Get, Query, Provide } from '@midwayjs/decorator';
import { Context } from 'egg';
import { decode } from 'iconv-lite';

import { UserService } from '../service/user';
import request from '../utils/request';
import { randHeader } from '../utils/index';
import { calcFixedPriceNumber, formatNumber } from '../utils/helper';
import { IStock } from '../types/stock';

@Provide()
@Controller('/frontend-node-plugin/stock')
export class StockController {
  @Inject()
  ctx: Context;

  @Inject()
  userService: UserService;

  /**
   *  根据列表，获取实时数据
   *  返回实时涨跌，实时价格
   * @param codesStr 'sz000034,sz000036'
   * @returns
   */
  @Get('/getRealTimeData')
  async getData(@Query() codesStr): Promise<IStock> {
    const codes = codesStr.split(',');
    const url = `http://hq.sinajs.cn/list=${codesStr}`;

    const resp = await request.get(url, {
      responseType: 'arraybuffer',
      transformResponse: [
        data => {
          const body = decode(data, 'GB18030');
          return body;
        },
      ],
      headers: randHeader(),
    });
    const stockList = [];
    if (/FAILED/.test(resp.data)) {
      return {
        success: false,
        message: `${codes[0]}错误代码，请查看是否缺少交易所信息`,
        data: resp.data,
      };
    }

    const splitData = resp.data.split(';\n');
    // let sz: LeekTreeItem | null = null;
    for (let i = 0; i < splitData.length - 1; i++) {
      const code = splitData[i].split('="')[0].split('var hq_str_')[1];
      const params = splitData[i].split('="')[1].split(',');
      let type = code.substr(0, 2) || 'sh';
      let symbol = code.substr(2);
      let stockItem: any;
      let fixedNumber = 2;
      if (params.length > 1) {
        if (/^(sh|sz)/.test(code)) {
          const open = params[1];
          const yestclose = params[2];
          const price = params[3];
          const high = params[4];
          const low = params[5];
          fixedNumber = calcFixedPriceNumber(open, yestclose, price, high, low);
          stockItem = {
            code,
            name: params[0],
            open: formatNumber(open, fixedNumber, false),
            yestclose: formatNumber(yestclose, fixedNumber, false),
            price: formatNumber(price, fixedNumber, false),
            low: formatNumber(low, fixedNumber, false),
            high: formatNumber(high, fixedNumber, false),
            volume: formatNumber(params[8], 2),
            amount: formatNumber(params[9], 2),
            time: `${params[30]} ${params[31]}`,
            percent: '',
          };
        } else if (/^hk/.test(code)) {
          const open = params[2];
          const yestclose = params[3];
          const price = params[6];
          const high = params[4];
          const low = params[5];
          fixedNumber = calcFixedPriceNumber(open, yestclose, price, high, low);
          stockItem = {
            code,
            name: params[1],
            open: formatNumber(open, fixedNumber, false),
            yestclose: formatNumber(yestclose, fixedNumber, false),
            price: formatNumber(price, fixedNumber, false),
            low: formatNumber(low, fixedNumber, false),
            high: formatNumber(high, fixedNumber, false),
            volume: formatNumber(params[12], 2),
            amount: formatNumber(params[11], 2),
            percent: ''
          };
        } else if (/^gb_/.test(code)) {
          symbol = code.substr(3);
          const open = params[5];
          const yestclose = params[26];
          const price = params[1];
          const high = params[6];
          const low = params[7];
          fixedNumber = calcFixedPriceNumber(open, yestclose, price, high, low);
          stockItem = {
            code,
            name: params[0],
            open: formatNumber(open, fixedNumber, false),
            yestclose: formatNumber(yestclose, fixedNumber, false),
            price: formatNumber(price, fixedNumber, false),
            low: formatNumber(low, fixedNumber, false),
            high: formatNumber(high, fixedNumber, false),
            volume: formatNumber(params[10], 2),
            amount: '接口无数据',
            percent: '',
          };
          type = code.substr(0, 3);
        } else if (/^usr_/.test(code)) {
          symbol = code.substr(4);
          const open = params[5];
          const yestclose = params[26];
          const price = params[1];
          const high = params[6];
          const low = params[7];
          fixedNumber = calcFixedPriceNumber(open, yestclose, price, high, low);
          stockItem = {
            code,
            name: params[0],
            open: formatNumber(open, fixedNumber, false),
            yestclose: formatNumber(yestclose, fixedNumber, false),
            price: formatNumber(price, fixedNumber, false),
            low: formatNumber(low, fixedNumber, false),
            high: formatNumber(high, fixedNumber, false),
            volume: formatNumber(params[10], 2),
            amount: '接口无数据',
            percent: '',
          };
          type = code.substr(0, 4);
        }
        if (stockItem) {
          const { yestclose, open } = stockItem;
          let { price } = stockItem;
          /*  if (open === price && price === '0.00') {
          stockItem.isStop = true;
        } */

          // 竞价阶段部分开盘和价格为0.00导致显示 -100%
          try {
            if (Number(open) <= 0) {
              price = yestclose;
            }
          } catch (err) {
            console.log('err: ', err);
          }
          stockItem.showLabel = '';
          stockItem.isStock = true;
          stockItem.type = type;
          stockItem.symbol = symbol;
          stockItem.updown = formatNumber(
            +price - +yestclose,
            fixedNumber,
            false
          );
          stockItem.percent =
            (stockItem.updown >= 0 ? '+' : '-') +
            formatNumber(
              (Math.abs(stockItem.updown) / +yestclose) * 100,
              2,
              false
            );

          stockList.push(stockItem);
        }
      } else {
        stockItem = {
          id: code,
          name: `接口不支持该股票 ${code}`,
          showLabel: '',
          isStock: true,
          percent: '',
          type: 'nodata',
          contextValue: 'nodata',
        };
        stockList.push(stockItem);
      }
    }

    return { success: true, message: 'OK', data: stockList };
  }
}
