"""
Timezone utilities for Vietnam timezone (UTC+7)
"""
from datetime import datetime, timezone, timedelta

# Vietnam timezone is UTC+7
VIETNAM_TZ = timezone(timedelta(hours=7))

def vietnam_now():
    """Get current datetime in Vietnam timezone (UTC+7)"""
    return datetime.now(VIETNAM_TZ)

def vietnam_utcnow():
    """Get current datetime in Vietnam timezone (UTC+7) - alias for vietnam_now()"""
    return vietnam_now()

