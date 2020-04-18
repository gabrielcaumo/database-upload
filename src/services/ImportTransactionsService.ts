/* eslint-disable no-restricted-syntax */
import path from 'path';
import fs from 'fs';

import uploadConfig from '../config/upload';

import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

interface Request {
  transactionsFilename: string;
}

interface TransactionData {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class ImportTransactionsService {
  async execute({ transactionsFilename }: Request): Promise<Transaction[]> {
    const createTransaction = new CreateTransactionService();

    const transactionsFilePath = path.join(
      uploadConfig.directory,
      transactionsFilename,
    );

    const readCSV = fs.readFileSync(transactionsFilePath, 'utf8');

    const separatedCSV = readCSV.split(/\r?\n/);

    const arrayOfTransactions = separatedCSV.filter(
      row => row !== '' && !row.startsWith('title'),
    );

    const inputTransactions = arrayOfTransactions.map(arrayofTransaction => {
      const separatedElements = arrayofTransaction.split(', ');

      const title = separatedElements[0];
      const type = separatedElements[1];
      const value = Number(separatedElements[2]);
      const category = separatedElements[3];

      const transaction = {
        title,
        type,
        value,
        category,
      } as TransactionData;

      return transaction;
    });

    // const promises = inputTransactions.map(async inputTransaction => {
    //   const transaction = await createTransaction.execute(inputTransaction);

    //   return transaction;
    // });

    // const transactions = await Promise.all(promises);

    const transactions = [];
    for await (const inputTransaction of inputTransactions) {
      const transaction = await createTransaction.execute(inputTransaction);

      transactions.push(transaction);
    }

    return transactions;
  }
}

export default ImportTransactionsService;
