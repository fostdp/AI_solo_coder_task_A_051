/**
 * DTU客户端
 * 模拟4G DTU HTTP上报
 * 支持失败重试
 * 记录上报日志
 */

const axios = require('axios');
const winston = require('winston');

class DTUClient {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || 'http://localhost:8080';
    this.endpoint = options.endpoint || '/api/sensor/data';
    this.maxRetries = options.maxRetries || 3;
    this.retryDelay = options.retryDelay || 2000;
    this.timeout = options.timeout || 10000;

    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
      ),
      defaultMeta: { service: 'dtu-client' },
      transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' })
      ]
    });

    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      }));
    }

    this.httpClient = axios.create({
      baseURL: this.baseUrl,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'DTU-Simulator/1.0'
      }
    });

    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      retries: 0
    };
  }

  async report(data, retryCount = 0) {
    this.stats.totalRequests++;

    try {
      const response = await this.httpClient.post(this.endpoint, data);

      this.stats.successfulRequests++;
      this.logger.info(`[${data.deviceId}] 上报成功 - 状态码: ${response.status}`, {
        deviceId: data.deviceId,
        deviceType: data.deviceType,
        timestamp: data.timestamp,
        statusCode: response.status
      });

      return {
        success: true,
        statusCode: response.status,
        data: response.data
      };
    } catch (error) {
      if (retryCount < this.maxRetries) {
        this.stats.retries++;
        this.logger.warn(`[${data.deviceId}] 上报失败，正在重试 (${retryCount + 1}/${this.maxRetries})`, {
          deviceId: data.deviceId,
          error: error.message,
          retryCount: retryCount + 1
        });

        await this._delay(this.retryDelay * (retryCount + 1));
        return this.report(data, retryCount + 1);
      }

      this.stats.failedRequests++;
      this.logger.error(`[${data.deviceId}] 上报失败，已达最大重试次数`, {
        deviceId: data.deviceId,
        error: error.message,
        statusCode: error.response?.status,
        data: data
      });

      return {
        success: false,
        error: error.message,
        statusCode: error.response?.status
      };
    }
  }

  async reportBatch(dataList) {
    const results = [];
    const startTime = Date.now();

    for (const data of dataList) {
      const result = await this.report(data);
      results.push(result);
      await this._delay(50 + Math.random() * 100);
    }

    const duration = Date.now() - startTime;
    const successCount = results.filter(r => r.success).length;

    this.logger.info(`批量上报完成 - 成功: ${successCount}/${dataList.length}, 耗时: ${duration}ms`, {
      total: dataList.length,
      success: successCount,
      failed: dataList.length - successCount,
      duration
    });

    return {
      total: dataList.length,
      success: successCount,
      failed: dataList.length - successCount,
      duration,
      results
    };
  }

  async reportBatchParallel(dataList, concurrency = 5) {
    const startTime = Date.now();
    const results = [];

    for (let i = 0; i < dataList.length; i += concurrency) {
      const chunk = dataList.slice(i, i + concurrency);
      const chunkPromises = chunk.map(data => this.report(data));
      const chunkResults = await Promise.all(chunkPromises);
      results.push(...chunkResults);
    }

    const duration = Date.now() - startTime;
    const successCount = results.filter(r => r.success).length;

    this.logger.info(`并行批量上报完成 - 成功: ${successCount}/${dataList.length}, 耗时: ${duration}ms`, {
      total: dataList.length,
      success: successCount,
      failed: dataList.length - successCount,
      duration,
      concurrency
    });

    return {
      total: dataList.length,
      success: successCount,
      failed: dataList.length - successCount,
      duration,
      results
    };
  }

  getStats() {
    return { ...this.stats };
  }

  resetStats() {
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      retries: 0
    };
  }

  async healthCheck() {
    try {
      const response = await this.httpClient.get('/health');
      return {
        healthy: true,
        status: response.status,
        data: response.data
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message,
        status: error.response?.status
      };
    }
  }

  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = DTUClient;
