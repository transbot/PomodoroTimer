import logging
from logging.handlers import RotatingFileHandler
from pathlib import Path
import os
from typing import Optional

def setup_logger(name: str = "tomatoclock", 
                log_level: int = logging.INFO,
                log_dir: str = "logs",
                max_bytes: int = 10 * 1024 * 1024,  # 10MB
                backup_count: int = 5) -> logging.Logger:
    """设置并返回配置好的logger"""
    
    # 创建日志目录
    os.makedirs(log_dir, exist_ok=True)
    
    # 创建logger
    logger = logging.getLogger(name)
    logger.setLevel(log_level)
    
    # 创建formatter
    formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )
    
    # 创建控制台handler
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    # 创建文件handler
    log_file = os.path.join(log_dir, "tomatoclock.log")
    file_handler = RotatingFileHandler(
        log_file, maxBytes=max_bytes, backupCount=backup_count
    )
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)
    
    return logger

def log_exception(logger: logging.Logger, exception: Exception, 
                 context: Optional[str] = None):
    """记录异常信息"""
    error_msg = f"Exception occurred: {str(exception)}"
    if context:
        error_msg = f"{context} - {error_msg}"
    logger.error(error_msg, exc_info=True)

def log_performance(logger: logging.Logger, operation: str, 
                   duration: float, **kwargs):
    """记录性能信息"""
    details = " ".join(f"{k}={v}" for k, v in kwargs.items())
    logger.info(f"Performance - {operation} took {duration:.2f}s {details}")

def log_user_action(logger: logging.Logger, user_id: int, 
                   action: str, **kwargs):
    """记录用户操作"""
    details = " ".join(f"{k}={v}" for k, v in kwargs.items())
    logger.info(f"User Action - user_id={user_id} {action} {details}")

def cleanup_logs(log_dir: str = "logs", 
                max_age_days: int = 30):
    """清理过期日志"""
    from datetime import datetime, timedelta
    import os
    import time
    
    now = datetime.now()
    cutoff = now - timedelta(days=max_age_days)
    
    for filename in os.listdir(log_dir):
        file_path = os.path.join(log_dir, filename)
        if os.path.isfile(file_path):
            file_time = datetime.fromtimestamp(os.path.getmtime(file_path))
            if file_time < cutoff:
                try:
                    os.remove(file_path)
                except Exception as e:
                    print(f"Error removing old log file {file_path}: {e}")
