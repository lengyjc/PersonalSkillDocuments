# 设计模式组合案例- EventBus

## 什么是EventBus

​	传递事件给事件处理器

![image-20200719150509426](https://i.loli.net/2020/07/19/2Ntun1yveHzV5RM.png)

## 为什么要用EventBus

![image-20200719150627487](https://i.loli.net/2020/07/19/8QVCTfdRNz3seiP.png)

## 如何实现EventBus

```c#
//1.添加抽象事件类
	/// <summary>
    /// 事件
    /// </summary>
    abstract class Event
    {
        // 事件源(就是对象)
        public object source { get; }

        protected Event(object source)
        {
            this.source = source;
        }
    }

//2. 添加监听接口
	 /// <summary>
    /// 事件监听器(处理事件)
    /// </summary>
    interface IEventListener
    {
        /// <summary>
        /// 事件处理
        /// </summary>
        /// <param name="event"></param>
        void OnEvent(Event @event);
    }

//3.实现事件巴士
	/// <summary>
    /// 事件总线
    /// 广播事件
    /// </summary>
    class EventBus
    {
        private EventBus() { }

        private static EventBus _eventBus = null;

        /// <summary>
        /// 初始化空的事件总件
        /// </summary>
        public static EventBus Instance
        {
            get
            {
                return _eventBus ?? (_eventBus = new EventBus());
            }
        }

        /// <summary>
        /// 监听器集合
        /// </summary>
        private static ISet<IEventListener> eventListeners = new HashSet<IEventListener>();

        /// <summary>
        /// 添加监听器(处理事件)
        /// </summary>
        /// <param name="eventListener"></param>
        public void AddListener(IEventListener eventListener)
        {
            eventListeners.Add(eventListener);
        }
       
        /// <summary>
        /// 移除监听器
        /// </summary>
        public void RemoveListener(IEventListener eventListener)
        {
            eventListeners.Remove(eventListener);
        }

        /// <summary>
        /// 发布事件
        /// </summary>
        public void PublishEvent(Event evnt)
        {
            if (evnt == null)
                throw new ArgumentNullException("evnt");
           
            // 循环通知
            foreach (var listener in eventListeners)
            {
                listener.OnEvent(evnt);
            }
        }
    }


//4.加入事件监听实现类和事件处理实现类
 	/// <summary>
    /// 数据库连接关系事件
    /// </summary>
    class ConnectionCloseEvent : Event
    {
        public ConnectionCloseEvent(object source) : base(source)
        {

        }
    }

	 /// <summary>
    /// Connection监听器
    /// </summary>
    class ConnectionListener : IEventListener
    {
        public void OnEvent(Event @event)
        {
            Console.WriteLine("事件被触发了");
        }
    }

	/// <summary>
    /// 老师发送通告事件
    /// </summary>
    class TeacherEventListener : IEventListener
    {
        public void OnEvent(Event @event)
        {
            throw new NotImplementedException();
        }
    }
	
	 /// <summary>
    /// 老师发送通告事件
    /// </summary>
    class TeacherSendNoticEvent : Event
    {
        public TeacherSendNoticEvent(object source) : base(source)
        {

        }
    }
```

```c#
//1.调用
				// 1、创建事件总线
                EventBus eventBus = EventBus.Instance;
                TeacherEventListener teacherEventListener = new TeacherEventListener();
                eventBus.AddListener(teacherEventListener);

                Teacher teacher = new Teacher();
                TeacherSendNoticEvent teacherSendNoticEvent = new TeacherSendNoticEvent(teacher);

                // 2、发布事件
                eventBus.PublishEvent(teacherSendNoticEvent);
```

