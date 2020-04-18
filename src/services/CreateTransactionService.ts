import { getCustomRepository, getRepository } from 'typeorm';

import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  private category_id: string;

  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);

    const balance = await transactionsRepository.getBalance();

    if (type === 'outcome' && balance.total < value) {
      throw new AppError('This outcome value is greater than the total');
    }

    const checkCategoryExists = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!checkCategoryExists) {
      const createdCategory = categoryRepository.create({
        title: category,
      });

      const saved_category = await categoryRepository.save(createdCategory);

      this.category_id = saved_category.id;
    } else {
      this.category_id = checkCategoryExists.id;
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id: this.category_id,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
