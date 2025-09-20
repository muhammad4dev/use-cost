import chalk from 'chalk';
import ora from 'ora';
import Table from 'cli-table3';

console.log(chalk.green('Hello World'));
const spinner = ora('Loading...').start();
const table = new Table();
