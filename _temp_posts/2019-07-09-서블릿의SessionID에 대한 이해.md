# 서블릿의 SessionID 에 대한 이해

## SessionID 생성 원리(톰캣 기준)

oracle의 서블릿 2.3 [스펙 문서](https://docs.oracle.com/cd/E17802_01/products/products/servlet/2.3/javadoc/javax/servlet/http/HttpSession.html#getId%28%29)
를 뒤져보면 ```HttpSession.getId()``` 에 대한 내용이 나온다.

```
getId

public java.lang.String getId()

	Returns a string containing the unique identifier assigned to this session. 
	The identifier is assigned by the servlet container and is implementation dependent.

Returns:
	a string specifying the identifier assigned to this session
```

여기서 주목할 것은 sessionId 에 해당하는 난수값에 대해서 서블릿 컨테이너에서 구현한 것을 사용만 할 뿐이라는 것을 알 수가 있다.


### 톰캣 구현체

톰캣에 대한 내용은 [공식 문서](https://tomcat.apache.org/tomcat-8.0-doc/config/sessionidgenerator.html)에서 찾아볼 수 있는 데,


server.xml 의 manager 영역에서 세션 정의자를 중첩해서 지정할 수 있다고 한다.
 
추가적으로 여기서 지정되지 않았을 경우에는 기본 형인 ```StandardSessionIdGenerator.class``` 를 사용한다.

```StandardSessionIdgenerator```는 부모 추상 클래스인 ```SessionIdGeneratorBase``` 를 구현하는 데, 이 녀석은    ```SessionIdGenerator```을 구현한 추상 구현체이다. (```SessionIdGeneratorBase``` 가 추상 메소드로 선언 된 것은 ```LifecycleBase``` 을 상속하기 위함이다.) SessionIdGenerator 는 sessionIdLength 를 참고해서 세션을 생성하도록 정의하고 있는 것을 참고할 수 있다. (물론 구현체에서 이를 생략해버릴 수도 있다.)

재미삼아 말하지만, SessionIdGeneratorBase 는 StandardSessionIdGenerator 외에도 LazySessionIdGenerator 에서 구현을 하고 있다.

[SessionIdGenerator](https://github.com/ningg/tomcat-8.0/blob/3c76b89c7639ef58836b1e9beb57276ee1604b66/apache-tomcat-8.0.21-src/webapps/docs/config/sessionidgenerator.xml)
```java
public interface SessionIdGenerator {

    /**
     * @return the node identifier associated with this node which will be
     * included in the generated session ID.
     */
    public String getJvmRoute();

    /**
     * Specify the node identifier associated with this node which will be
     * included in the generated session ID.
     *
     * @param jvmRoute  The node identifier
     */
    public void setJvmRoute(String jvmRoute);

    /**
     * @return the number of bytes for a session ID
     */
    public int getSessionIdLength();

    /**
     * Specify the number of bytes for a session ID
     *
     * @param sessionIdLength   Number of bytes
     */
    public void setSessionIdLength(int sessionIdLength);

    /**
     * Generate and return a new session identifier.
     *
     * @return the newly generated session id
     */
    public String generateSessionId();

    /**
     * Generate and return a new session identifier.
     *
     * @param route   node identifier to include in generated id
     * @return the newly generated session id
     */
    public String generateSessionId(String route);
}

```

[StandardSessionIdgenerator.Java](https://github.com/ningg/tomcat-8.0/blob/master/apache-tomcat-8.0.21-src/java/org/apache/catalina/util/StandardSessionIdGenerator.java)

```java
package org.apache.catalina.util;

public class StandardSessionIdGenerator extends SessionIdGeneratorBase {

    @Override
    public String generateSessionId(String route) {

        byte random[] = new byte[16];
        int sessionIdLength = getSessionIdLength();

        // Render the result as a String of hexadecimal digits
        // Start with enough space for sessionIdLength and medium route size
        StringBuilder buffer = new StringBuilder(2 * sessionIdLength + 20);

        int resultLenBytes = 0;

        while (resultLenBytes < sessionIdLength) {
            getRandomBytes(random);
            for (int j = 0;
            j < random.length && resultLenBytes < sessionIdLength;
            j++) {
                byte b1 = (byte) ((random[j] & 0xf0) >> 4);
                byte b2 = (byte) (random[j] & 0x0f);
                if (b1 < 10)
                    buffer.append((char) ('0' + b1));
                else
                    buffer.append((char) ('A' + (b1 - 10)));
                if (b2 < 10)
                    buffer.append((char) ('0' + b2));
                else
                    buffer.append((char) ('A' + (b2 - 10)));
                resultLenBytes++;
            }
        }

        if (route != null && route.length() > 0) {
            buffer.append('.').append(route);
        } else {
            String jvmRoute = getJvmRoute();
            if (jvmRoute != null && jvmRoute.length() > 0) {
                buffer.append('.').append(jvmRoute);
            }
        }

        return buffer.toString();
    }

}

```

Manager 에 대한 이야기는 [톰캣 문서](http://tomcat.apache.org/tomcat-7.0-doc/security-howto.html#Manager) 에서 살짝 힌트를 얼을 수 있다.

```

Manager
	The manager component is used to generate session IDs.

	The class used to generate random session IDs may be changed with the randomClass attribute.

	The length of the session ID may be changed with the sessionIdLength attribute.
```


Manager 는 각 세션에 대한 관리를 위한 세부 기능들이 정의되어 있다. 세션 검색부터 생성, 만료까지 모든 것이 정의되어 있는 걸 알 수 있다.

```java
/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.apache.catalina;

import java.beans.PropertyChangeListener;
import java.io.IOException;

/**
 * A <b>Manager</b> manages the pool of Sessions that are associated with a
 * particular Context. Different Manager implementations may support
 * value-added features such as the persistent storage of session data,
 * as well as migrating sessions for distributable web applications.
 * <p>
 * In order for a <code>Manager</code> implementation to successfully operate
 * with a <code>Context</code> implementation that implements reloading, it
 * must obey the following constraints:
 * <ul>
 * <li>Must implement <code>Lifecycle</code> so that the Context can indicate
 *     that a restart is required.
 * <li>Must allow a call to <code>stop()</code> to be followed by a call to
 *     <code>start()</code> on the same <code>Manager</code> instance.
 * </ul>
 *
 * @author Craig R. McClanahan
 */
public interface Manager {

    // ------------------------------------------------------------- Properties

    /**
     * Get the Context with which this Manager is associated.
     *
     * @return The associated Context
     */
    public Context getContext();


    /**
     * Set the Context with which this Manager is associated. The Context must
     * be set to a non-null value before the Manager is first used. Multiple
     * calls to this method before first use are permitted. Once the Manager has
     * been used, this method may not be used to change the Context (including
     * setting a {@code null} value) that the Manager is associated with.
     *
     * @param context The newly associated Context
     */
    public void setContext(Context context);


    /**
     * @return the session id generator
     */
    public SessionIdGenerator getSessionIdGenerator();


    /**
     * Sets the session id generator
     *
     * @param sessionIdGenerator The session id generator
     */
    public void setSessionIdGenerator(SessionIdGenerator sessionIdGenerator);


    /**
     * Returns the total number of sessions created by this manager.
     *
     * @return Total number of sessions created by this manager.
     */
    public long getSessionCounter();


    /**
     * Sets the total number of sessions created by this manager.
     *
     * @param sessionCounter Total number of sessions created by this manager.
     */
    public void setSessionCounter(long sessionCounter);


    /**
     * Gets the maximum number of sessions that have been active at the same
     * time.
     *
     * @return Maximum number of sessions that have been active at the same
     * time
     */
    public int getMaxActive();


    /**
     * (Re)sets the maximum number of sessions that have been active at the
     * same time.
     *
     * @param maxActive Maximum number of sessions that have been active at
     * the same time.
     */
    public void setMaxActive(int maxActive);


    /**
     * Gets the number of currently active sessions.
     *
     * @return Number of currently active sessions
     */
    public int getActiveSessions();


    /**
     * Gets the number of sessions that have expired.
     *
     * @return Number of sessions that have expired
     */
    public long getExpiredSessions();


    /**
     * Sets the number of sessions that have expired.
     *
     * @param expiredSessions Number of sessions that have expired
     */
    public void setExpiredSessions(long expiredSessions);


    /**
     * Gets the number of sessions that were not created because the maximum
     * number of active sessions was reached.
     *
     * @return Number of rejected sessions
     */
    public int getRejectedSessions();


    /**
     * Gets the longest time (in seconds) that an expired session had been
     * alive.
     *
     * @return Longest time (in seconds) that an expired session had been
     * alive.
     */
    public int getSessionMaxAliveTime();


    /**
     * Sets the longest time (in seconds) that an expired session had been
     * alive.
     *
     * @param sessionMaxAliveTime Longest time (in seconds) that an expired
     * session had been alive.
     */
    public void setSessionMaxAliveTime(int sessionMaxAliveTime);


    /**
     * Gets the average time (in seconds) that expired sessions had been
     * alive. This may be based on sample data.
     *
     * @return Average time (in seconds) that expired sessions had been
     * alive.
     */
    public int getSessionAverageAliveTime();


    /**
     * Gets the current rate of session creation (in session per minute). This
     * may be based on sample data.
     *
     * @return  The current rate (in sessions per minute) of session creation
     */
    public int getSessionCreateRate();


    /**
     * Gets the current rate of session expiration (in session per minute). This
     * may be based on sample data
     *
     * @return  The current rate (in sessions per minute) of session expiration
     */
    public int getSessionExpireRate();


    // --------------------------------------------------------- Public Methods

    /**
     * Add this Session to the set of active Sessions for this Manager.
     *
     * @param session Session to be added
     */
    public void add(Session session);


    /**
     * Add a property change listener to this component.
     *
     * @param listener The listener to add
     */
    public void addPropertyChangeListener(PropertyChangeListener listener);


    /**
     * Change the session ID of the current session to a new randomly generated
     * session ID.
     *
     * @param session   The session to change the session ID for
     */
    public void changeSessionId(Session session);


    /**
     * Change the session ID of the current session to a specified session ID.
     *
     * @param session   The session to change the session ID for
     * @param newId   new session ID
     */
    public void changeSessionId(Session session, String newId);


    /**
     * Get a session from the recycled ones or create a new empty one.
     * The PersistentManager manager does not need to create session data
     * because it reads it from the Store.
     *
     * @return An empty Session object
     */
    public Session createEmptySession();


    /**
     * Construct and return a new session object, based on the default
     * settings specified by this Manager's properties.  The session
     * id specified will be used as the session id.
     * If a new session cannot be created for any reason, return
     * <code>null</code>.
     *
     * @param sessionId The session id which should be used to create the
     *  new session; if <code>null</code>, the session
     *  id will be assigned by this method, and available via the getId()
     *  method of the returned session.
     * @exception IllegalStateException if a new session cannot be
     *  instantiated for any reason
     *
     * @return An empty Session object with the given ID or a newly created
     *         session ID if none was specified
     */
    public Session createSession(String sessionId);


    /**
     * Return the active Session, associated with this Manager, with the
     * specified session id (if any); otherwise return <code>null</code>.
     *
     * @param id The session id for the session to be returned
     *
     * @exception IllegalStateException if a new session cannot be
     *  instantiated for any reason
     * @exception IOException if an input/output error occurs while
     *  processing this request
     *
     * @return the request session or {@code null} if a session with the
     *         requested ID could not be found
     */
    public Session findSession(String id) throws IOException;


    /**
     * Return the set of active Sessions associated with this Manager.
     * If this Manager has no active Sessions, a zero-length array is returned.
     *
     * @return All the currently active sessions managed by this manager
     */
    public Session[] findSessions();


    /**
     * Load any currently active sessions that were previously unloaded
     * to the appropriate persistence mechanism, if any.  If persistence is not
     * supported, this method returns without doing anything.
     *
     * @exception ClassNotFoundException if a serialized class cannot be
     *  found during the reload
     * @exception IOException if an input/output error occurs
     */
    public void load() throws ClassNotFoundException, IOException;


    /**
     * Remove this Session from the active Sessions for this Manager.
     *
     * @param session Session to be removed
     */
    public void remove(Session session);


    /**
     * Remove this Session from the active Sessions for this Manager.
     *
     * @param session   Session to be removed
     * @param update    Should the expiration statistics be updated
     */
    public void remove(Session session, boolean update);


    /**
     * Remove a property change listener from this component.
     *
     * @param listener The listener to remove
     */
    public void removePropertyChangeListener(PropertyChangeListener listener);


    /**
     * Save any currently active sessions in the appropriate persistence
     * mechanism, if any.  If persistence is not supported, this method
     * returns without doing anything.
     *
     * @exception IOException if an input/output error occurs
     */
    public void unload() throws IOException;


    /**
     * This method will be invoked by the context/container on a periodic
     * basis and allows the manager to implement
     * a method that executes periodic tasks, such as expiring sessions etc.
     */
    public void backgroundProcess();


    /**
     * Would the Manager distribute the given session attribute? Manager
     * implementations may provide additional configuration options to control
     * which attributes are distributable.
     *
     * @param name  The attribute name
     * @param value The attribute value
     *
     * @return {@code true} if the Manager would distribute the given attribute
     *         otherwise {@code false}
     */
    public boolean willAttributeDistribute(String name, Object value);


    /**
     * When an attribute that is already present in the session is added again
     * under the same name and the attribute implements {@link
     * javax.servlet.http.HttpSessionBindingListener}, should
     * {@link javax.servlet.http.HttpSessionBindingListener#valueUnbound(javax.servlet.http.HttpSessionBindingEvent)}
     * be called followed by
     * {@link javax.servlet.http.HttpSessionBindingListener#valueBound(javax.servlet.http.HttpSessionBindingEvent)}?
     * <p>
     * The default value is {@code false}.
     *
     * @return {@code true} if the listener will be notified, {@code false} if
     *         it will not
     */
    public default boolean getNotifyBindingListenerOnUnchangedValue() {
        return false;
    }


    /**
     * Configure if
     * {@link javax.servlet.http.HttpSessionBindingListener#valueUnbound(javax.servlet.http.HttpSessionBindingEvent)}
     * be called followed by
     * {@link javax.servlet.http.HttpSessionBindingListener#valueBound(javax.servlet.http.HttpSessionBindingEvent)}
     * when an attribute that is already present in the session is added again
     * under the same name and the attribute implements {@link
     * javax.servlet.http.HttpSessionBindingListener}.
     *
     * @param notifyBindingListenerOnUnchangedValue {@code true} the listener
     *                                              will be called, {@code
     *                                              false} it will not
     */
    public void setNotifyBindingListenerOnUnchangedValue(
            boolean notifyBindingListenerOnUnchangedValue);


    /**
     * When an attribute that is already present in the session is added again
     * under the same name and a {@link
     * javax.servlet.http.HttpSessionAttributeListener} is configured for the
     * session should
     * {@link javax.servlet.http.HttpSessionAttributeListener#attributeReplaced(javax.servlet.http.HttpSessionBindingEvent)}
     * be called?
     * <p>
     * The default value is {@code true}.
     *
     * @return {@code true} if the listener will be notified, {@code false} if
     *         it will not
     */
    public default boolean getNotifyAttributeListenerOnUnchangedValue() {
        return true;
    }


    /**
     * Configure if
     * {@link javax.servlet.http.HttpSessionAttributeListener#attributeReplaced(javax.servlet.http.HttpSessionBindingEvent)}
     * when an attribute that is already present in the session is added again
     * under the same name and a {@link
     * javax.servlet.http.HttpSessionAttributeListener} is configured for the
     * session.
     *
     * @param notifyAttributeListenerOnUnchangedValue {@code true} the listener
     *                                                will be called, {@code
     *                                                false} it will not
     */
    public void setNotifyAttributeListenerOnUnchangedValue(
            boolean notifyAttributeListenerOnUnchangedValue);
}

```


우리가 rememberMe 와 같은 기능에 해당하는 것은 
```java
/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package javax.servlet;

/**
 * Configures the session cookies used by the web application associated with
 * the ServletContext from which this SessionCookieConfig was obtained.
 *
 * @since Servlet 3.0
 */
public interface SessionCookieConfig {

    /**
     * Sets the session cookie name.
     *
     * @param name The name of the session cookie
     *
     * @throws IllegalStateException if the associated ServletContext has
     *         already been initialised
     */
    public void setName(String name);

    public String getName();

    /**
     * Sets the domain for the session cookie
     *
     * @param domain The session cookie domain
     *
     * @throws IllegalStateException if the associated ServletContext has
     *         already been initialised
     */
    public void setDomain(String domain);

    public String getDomain();

    /**
     * Sets the path of the session cookie.
     *
     * @param path The session cookie path
     *
     * @throws IllegalStateException if the associated ServletContext has
     *         already been initialised
     */
    public void setPath(String path);

    public String getPath();

    /**
     * Sets the comment for the session cookie
     *
     * @param comment The session cookie comment
     *
     * @throws IllegalStateException if the associated ServletContext has
     *         already been initialised
     */
    public void setComment(String comment);

    public String getComment();

    /**
     * Sets the httpOnly flag for the session cookie.
     *
     * @param httpOnly The httpOnly setting to use for session cookies
     *
     * @throws IllegalStateException if the associated ServletContext has
     *         already been initialised
     */
    public void setHttpOnly(boolean httpOnly);

    public boolean isHttpOnly();

    /**
     * Sets the secure flag for the session cookie.
     *
     * @param secure The secure setting to use for session cookies
     *
     * @throws IllegalStateException if the associated ServletContext has
     *         already been initialised
     */
    public void setSecure(boolean secure);

    public boolean isSecure();

    /**
     * Sets the maximum age.
     *
     * @param MaxAge the maximum age to set
     * @throws IllegalStateException if the associated ServletContext has
     *         already been initialised
     */
    public void setMaxAge(int MaxAge);

    public int getMaxAge();

}

```

Manager의 기본 구현체인 ManagerBase 를 보면 단순히 session 에 대한 정보는 ConcurrentHashMap 으로 관리하는 것을 알수가 있다.

```
   protected Map<String, Session> sessions = new ConcurrentHashMap<>();
```

여기서 드는 의문은 사용자가 브라우저를 닫기 전까지 session 이 고유하게 담기는 데 이에 대한 처리를 어떻게 하는지 알고 싶어진다. 이에 대한 이야기는 HttpSession 의 주석에서 살펴 볼 수 있다.

```java
/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package javax.servlet.http;

import java.util.Enumeration;

import javax.servlet.ServletContext;

/**
 * Provides a way to identify a user across more than one page request or visit
 * to a Web site and to store information about that user.
 * <p>
 * The servlet container uses this interface to create a session between an HTTP
 * client and an HTTP server. The session persists for a specified time period,
 * across more than one connection or page request from the user. A session
 * usually corresponds to one user, who may visit a site many times. The server
 * can maintain a session in many ways such as using cookies or rewriting URLs.
 * <p>
 * This interface allows servlets to
 * <ul>
 * <li>View and manipulate information about a session, such as the session
 * identifier, creation time, and last accessed time
 * <li>Bind objects to sessions, allowing user information to persist across
 * multiple user connections
 * </ul>
 * <p>
 * When an application stores an object in or removes an object from a session,
 * the session checks whether the object implements
 * {@link HttpSessionBindingListener}. If it does, the servlet notifies the
 * object that it has been bound to or unbound from the session. Notifications
 * are sent after the binding methods complete. For session that are invalidated
 * or expire, notifications are sent after the session has been invalidated or
 * expired.
 * <p>
 * When container migrates a session between VMs in a distributed container
 * setting, all session attributes implementing the
 * {@link HttpSessionActivationListener} interface are notified.
 * <p>
 * A servlet should be able to handle cases in which the client does not choose
 * to join a session, such as when cookies are intentionally turned off. Until
 * the client joins the session, <code>isNew</code> returns <code>true</code>.
 * If the client chooses not to join the session, <code>getSession</code> will
 * return a different session on each request, and <code>isNew</code> will
 * always return <code>true</code>.
 * <p>
 * Session information is scoped only to the current web application (
 * <code>ServletContext</code>), so information stored in one context will not
 * be directly visible in another.
 *
 * @see HttpSessionBindingListener
 */
public interface HttpSession {

    /**
     * Returns the time when this session was created, measured in milliseconds
     * since midnight January 1, 1970 GMT.
     *
     * @return a <code>long</code> specifying when this session was created,
     *         expressed in milliseconds since 1/1/1970 GMT
     * @exception IllegalStateException
     *                if this method is called on an invalidated session
     */
    public long getCreationTime();

    /**
     * Returns a string containing the unique identifier assigned to this
     * session. The identifier is assigned by the servlet container and is
     * implementation dependent.
     *
     * @return a string specifying the identifier assigned to this session
     * @exception IllegalStateException
     *                if this method is called on an invalidated session
     */
    public String getId();

    /**
     * Returns the last time the client sent a request associated with this
     * session, as the number of milliseconds since midnight January 1, 1970
     * GMT, and marked by the time the container received the request.
     * <p>
     * Actions that your application takes, such as getting or setting a value
     * associated with the session, do not affect the access time.
     *
     * @return a <code>long</code> representing the last time the client sent a
     *         request associated with this session, expressed in milliseconds
     *         since 1/1/1970 GMT
     * @exception IllegalStateException
     *                if this method is called on an invalidated session
     */
    public long getLastAccessedTime();

    /**
     * Returns the ServletContext to which this session belongs.
     *
     * @return The ServletContext object for the web application
     * @since 2.3
     */
    public ServletContext getServletContext();

    /**
     * Specifies the time, in seconds, between client requests before the
     * servlet container will invalidate this session. A zero or negative time
     * indicates that the session should never timeout.
     *
     * @param interval
     *            An integer specifying the number of seconds
     */
    public void setMaxInactiveInterval(int interval);

    /**
     * Returns the maximum time interval, in seconds, that the servlet container
     * will keep this session open between client accesses. After this interval,
     * the servlet container will invalidate the session. The maximum time
     * interval can be set with the <code>setMaxInactiveInterval</code> method.
     * A zero or negative time indicates that the session should never timeout.
     *
     * @return an integer specifying the number of seconds this session remains
     *         open between client requests
     * @see #setMaxInactiveInterval
     */
    public int getMaxInactiveInterval();

    /**
     * Do not use.
     * @return A dummy implementation of HttpSessionContext
     * @deprecated As of Version 2.1, this method is deprecated and has no
     *             replacement. It will be removed in a future version of the
     *             Java Servlet API.
     */
    @Deprecated
    public HttpSessionContext getSessionContext();

    /**
     * Returns the object bound with the specified name in this session, or
     * <code>null</code> if no object is bound under the name.
     *
     * @param name
     *            a string specifying the name of the object
     * @return the object with the specified name
     * @exception IllegalStateException
     *                if this method is called on an invalidated session
     */
    public Object getAttribute(String name);

    /**
     * @param name
     *            a string specifying the name of the object
     * @return the object with the specified name
     * @exception IllegalStateException
     *                if this method is called on an invalidated session
     * @deprecated As of Version 2.2, this method is replaced by
     *             {@link #getAttribute}.
     */
    @Deprecated
    public Object getValue(String name);

    /**
     * Returns an <code>Enumeration</code> of <code>String</code> objects
     * containing the names of all the objects bound to this session.
     *
     * @return an <code>Enumeration</code> of <code>String</code> objects
     *         specifying the names of all the objects bound to this session
     * @exception IllegalStateException
     *                if this method is called on an invalidated session
     */
    public Enumeration<String> getAttributeNames();

    /**
     * @return an array of <code>String</code> objects specifying the names of
     *         all the objects bound to this session
     * @exception IllegalStateException
     *                if this method is called on an invalidated session
     * @deprecated As of Version 2.2, this method is replaced by
     *             {@link #getAttributeNames}
     */
    @Deprecated
    public String[] getValueNames();

    /**
     * Binds an object to this session, using the name specified. If an object
     * of the same name is already bound to the session, the object is replaced.
     * <p>
     * After this method executes, and if the new object implements
     * <code>HttpSessionBindingListener</code>, the container calls
     * <code>HttpSessionBindingListener.valueBound</code>. The container then
     * notifies any <code>HttpSessionAttributeListener</code>s in the web
     * application.
     * <p>
     * If an object was already bound to this session of this name that
     * implements <code>HttpSessionBindingListener</code>, its
     * <code>HttpSessionBindingListener.valueUnbound</code> method is called.
     * <p>
     * If the value passed in is null, this has the same effect as calling
     * <code>removeAttribute()</code>.
     *
     * @param name
     *            the name to which the object is bound; cannot be null
     * @param value
     *            the object to be bound
     * @exception IllegalStateException
     *                if this method is called on an invalidated session
     */
    public void setAttribute(String name, Object value);

    /**
     * @param name
     *            the name to which the object is bound; cannot be null
     * @param value
     *            the object to be bound; cannot be null
     * @exception IllegalStateException
     *                if this method is called on an invalidated session
     * @deprecated As of Version 2.2, this method is replaced by
     *             {@link #setAttribute}
     */
    @Deprecated
    public void putValue(String name, Object value);

    /**
     * Removes the object bound with the specified name from this session. If
     * the session does not have an object bound with the specified name, this
     * method does nothing.
     * <p>
     * After this method executes, and if the object implements
     * <code>HttpSessionBindingListener</code>, the container calls
     * <code>HttpSessionBindingListener.valueUnbound</code>. The container then
     * notifies any <code>HttpSessionAttributeListener</code>s in the web
     * application.
     *
     * @param name
     *            the name of the object to remove from this session
     * @exception IllegalStateException
     *                if this method is called on an invalidated session
     */
    public void removeAttribute(String name);

    /**
     * @param name
     *            the name of the object to remove from this session
     * @exception IllegalStateException
     *                if this method is called on an invalidated session
     * @deprecated As of Version 2.2, this method is replaced by
     *             {@link #removeAttribute}
     */
    @Deprecated
    public void removeValue(String name);

    /**
     * Invalidates this session then unbinds any objects bound to it.
     *
     * @exception IllegalStateException
     *                if this method is called on an already invalidated session
     */
    public void invalidate();

    /**
     * Returns <code>true</code> if the client does not yet know about the
     * session or if the client chooses not to join the session. For example, if
     * the server used only cookie-based sessions, and the client had disabled
     * the use of cookies, then a session would be new on each request.
     *
     * @return <code>true</code> if the server has created a session, but the
     *         client has not yet joined
     * @exception IllegalStateException
     *                if this method is called on an already invalidated session
     */
    public boolean isNew();
}

```

- 정리를 하면 클라이언트 SessionID 를 만드는 것은 톰캣 기본 구현체 기준으로 단순히 요청의 패킷에 대한 난수 값으로 만들 뿐이다. 최초 request 를 식별할 수 있었던 것은 절대 아니다.

- 이후 만들어진 난수는 cookie 에 실려서 응답되고, 이 cookie 는 해당 브라우저가 닫히기 전까지는 존재하는 임시 쿠키로써의 만료 시간을 가진다. 이 임시 쿠키를 직접 살펴보면 remember me 와 달리 expire date 영역에 session 이라고 잡힌 것을 알수가 있다.

- http rfc 를 보면 cookie 는 특별한 설정없이는 무조건 http request header 에 무조건 삽입되게 되어있다. 그래서 cookie 의 용량 제한이 있는 것이다.

- 즉 최초의 난수를 만든 sessionId는 유저 의 request 패킷에서 특별한 값을 식별할 수 있어서 만드는 것이 아니고, 단순히 난수를 response <-> request 에 계속 달려있기에 구분을 할 뿐인 것이다.

- 실제로 브라우저에서 이 임시 cookie 의 sessionId 값을 null 이나 cookie 를 삭제해버리면, 같은 브라우저의 같은 브라우저 탭이더라도 서버에서 새로 만드는 것을 알수가 있다. 또한 이기종 브라우저 간에도 사용자가 인위적으로 크롬 브라우저의 쿠키를 엣지 브라우저의 쿠키에 덮어씌울 경우, 엣지 브라우저에서 크롬 브라우저의 세션을 사용할 수가 있다.



서블릿은 기본적으로 web.xml 이 존재하면 (또는 [WebApplicationInitializer](https://docs.spring.io/spring/docs/current/javadoc-api/org/springframework/web/WebApplicationInitializer.html) 를 구현체가 존재한다면 ) 해당 설정에서 서블릿 구동을 위한 각종 준비 환경을 준비하게 된다. 우리는 스프링 프레임워크를 사용하기 때문에 서블릿이 구동되는 환경에 스프링 빈 관리를 해주는 스프링 코어인 spring context (또는 빈 컨테이너)를 올리게 된다.

재밌는 것은 WebApplicationInitializer 어떻게 톰캣에게 알려지게 되는가 이다. 
이는 톰캣(서블릿 컨테이너)의 동작 원리를 알면 쉽게 이해가 되는데, 스프링에서 만든 SpringServletContainerInitializer 는 org.springframework.web 패키지를 받으면 자연적으로 존재하게 된다.  이 친구는 ```ServletContainerInitializer``` 서블릿 사양을 구현하는 데, 서블릿 컨테이너가 초기화되는 이벤트 때, JAR Services API (ServiceLoader # load (Class)) 사양에 의해서 ServletContainerInitializer  를 구현한 모든 것이 로드가 되게 된다.
ServletContainerInitializer 를 구현한 SpringServletContainerInitializer 에는 아래와 같은 onStartup 메소드를 통해 WebApplicationInitializer 를 감지하게 된다. 문제는 기본적으로 web.xml 의 로드가 완료되면 서블릿 컨테이너는 기본 사양으로 다른 서블릿컨테이너이니셜라이저를 로드하지 않는다. [참고](https://stackoverflow.com/questions/10776599/servletcontainerinitializer-vs-servletcontextlistener)


```java
@Override
	public void onStartup(Set<Class<?>> webAppInitializerClasses, ServletContext servletContext)
			throws ServletException {

		List<WebApplicationInitializer> initializers = new LinkedList<WebApplicationInitializer>();

		if (webAppInitializerClasses != null) {
			for (Class<?> waiClass : webAppInitializerClasses) {
				// Be defensive: Some servlet containers provide us with invalid classes,
				// no matter what @HandlesTypes says...
				if (!waiClass.isInterface() && !Modifier.isAbstract(waiClass.getModifiers()) &&
						WebApplicationInitializer.class.isAssignableFrom(waiClass)) {
					try {
						initializers.add((WebApplicationInitializer) waiClass.newInstance());
					}
					catch (Throwable ex) {
						throw new ServletException("Failed to instantiate WebApplicationInitializer class", ex);
					}
				}
			}
		}

		if (initializers.isEmpty()) {
			servletContext.log("No Spring WebApplicationInitializer types detected on classpath");
			return;
		}

		servletContext.log(initializers.size() + " Spring WebApplicationInitializers detected on classpath");
		AnnotationAwareOrderComparator.sort(initializers);
		for (WebApplicationInitializer initializer : initializers) {
			initializer.onStartup(servletContext);
		}
	}
```

자세한 것은 [참고](https://stackoverflow.com/questions/28131102/how-servlet-container-finds-webapplicationinitializer-implementations)


이런 마법은 서블릿 3.0 부터 web.xml 이 optional 로 바뀌었기 때문에 가능해진 것이다. 자세한 것은 서블릿 스펙을 살펴보라.

톰캣7(서블릿3.0 을 구현) 으로 구동되고 web.xml 로 구성된 레거시 코드가 있다면


AbstractAnnotationConfigDispatcherServletInitializer 을 상속한 WebApplicationInitializer 을 구현한 클래스를 만들어두고 그 클래스에 디버깅을 걸어보아라. 톰캣이 실행되면서 같이 실행되는 것을 알 수가 있다.

아래는 톰캣에서 WebApplicationInitializerFourones이 호출 되기 까지의 호출 스택이다.

```
<init>:9, WebApplicationInitializerFouronesImpl (com.glqdlt.ex)
newInstance0:-1, NativeConstructorAccessorImpl (sun.reflect)
newInstance:62, NativeConstructorAccessorImpl (sun.reflect)
newInstance:45, DelegatingConstructorAccessorImpl (sun.reflect)
newInstance:423, Constructor (java.lang.reflect)
newInstance:442, Class (java.lang)
onStartup:152, SpringServletContainerInitializer (org.springframework.web)
startInternal:5506, StandardContext (org.apache.catalina.core)
start:150, LifecycleBase (org.apache.catalina.util)
addChildInternal:901, ContainerBase (org.apache.catalina.core)
addChild:877, ContainerBase (org.apache.catalina.core)
addChild:652, StandardHost (org.apache.catalina.core)
manageApp:1809, HostConfig (org.apache.catalina.startup)
invoke0:-1, NativeMethodAccessorImpl (sun.reflect)
invoke:62, NativeMethodAccessorImpl (sun.reflect)
invoke:43, DelegatingMethodAccessorImpl (sun.reflect)
invoke:498, Method (java.lang.reflect)
invoke:301, BaseModelMBean (org.apache.tomcat.util.modeler)
invoke:819, DefaultMBeanServerInterceptor (com.sun.jmx.interceptor)
invoke:801, JmxMBeanServer (com.sun.jmx.mbeanserver)
createStandardContext:618, MBeanFactory (org.apache.catalina.mbeans)
createStandardContext:565, MBeanFactory (org.apache.catalina.mbeans)
invoke0:-1, NativeMethodAccessorImpl (sun.reflect)
invoke:62, NativeMethodAccessorImpl (sun.reflect)
invoke:43, DelegatingMethodAccessorImpl (sun.reflect)
invoke:498, Method (java.lang.reflect)
invoke:301, BaseModelMBean (org.apache.tomcat.util.modeler)
invoke:819, DefaultMBeanServerInterceptor (com.sun.jmx.interceptor)
invoke:801, JmxMBeanServer (com.sun.jmx.mbeanserver)
invoke:468, MBeanServerAccessController (com.sun.jmx.remote.security)
doOperation:1468, RMIConnectionImpl (javax.management.remote.rmi)
access$300:76, RMIConnectionImpl (javax.management.remote.rmi)
run:1309, RMIConnectionImpl$PrivilegedOperation (javax.management.remote.rmi)
doPrivileged:-1, AccessController (java.security)
doPrivilegedOperation:1408, RMIConnectionImpl (javax.management.remote.rmi)
invoke:829, RMIConnectionImpl (javax.management.remote.rmi)
invoke0:-1, NativeMethodAccessorImpl (sun.reflect)
invoke:62, NativeMethodAccessorImpl (sun.reflect)
invoke:43, DelegatingMethodAccessorImpl (sun.reflect)
invoke:498, Method (java.lang.reflect)
dispatch:357, UnicastServerRef (sun.rmi.server)
run:200, Transport$1 (sun.rmi.transport)
run:197, Transport$1 (sun.rmi.transport)
doPrivileged:-1, AccessController (java.security)
serviceCall:196, Transport (sun.rmi.transport)
handleMessages:573, TCPTransport (sun.rmi.transport.tcp)
run0:834, TCPTransport$ConnectionHandler (sun.rmi.transport.tcp)
lambda$run$0:688, TCPTransport$ConnectionHandler (sun.rmi.transport.tcp)
run:-1, 937444256 (sun.rmi.transport.tcp.TCPTransport$ConnectionHandler$$Lambda$5)
doPrivileged:-1, AccessController (java.security)
run:687, TCPTransport$ConnectionHandler (sun.rmi.transport.tcp)
runWorker:1149, ThreadPoolExecutor (java.util.concurrent)
run:624, ThreadPoolExecutor$Worker (java.util.concurrent)
run:748, Thread (java.lang)
```


우리는 SpringSessionJdbc 를 사용할 것이다. REDIS 에 대한 가이드는 많이 있으니 알아서 보도록 해라.
JDBC 를 사용하는 것은 현재 근무하는 곳이 기술 스택이 매우 레거시하고 부채가 심각하기 때문이다. 

```@EnableScheduling``` 이 하는 역활은 세션 만료일이 도례한 등록 세션을 제거해주는 역활을 한다. RDB 구조상 의미 없이 쌓이는 데이터는 제거를 해줘야 검색 속도가 높아지기 때문이다.

[공식가이드](https://docs.spring.io/spring-session/docs/current-SNAPSHOT/reference/html/httpsession.html) 를 보면 ```@EnableJdbcHttpSession ```  를 사용해라는 무책임한 내용이 있는 것을 알수가 있다. EnableJdbcHttpSession 은 JdbcHttpSessionConfiguration 의 설정을 활성화 시켜주고 서블릿 컨테이너에 필터를 등록시켜주는 역활을 한다. 
JdbcHttpSessionConfiguration 의 내부에는 sessionRepository 라는 이름의 빈을 등록시켜주는 역활이 대다수이다. 사실 sessionRepository 는 JdbcOperationsSessionRepository 인데,  이름에서 알 수 있듯이 JDBC 를 사용하는 레포지토리 클래스이고, 빈 속성으로 datasource 나 트랜잭션 매니저를 의존하는 빈 이다보니, JdbcHttpSessionConfiguration 내부에는 Datasource 와 txm 을 찾는 것 밖에 없다.  JdbcHttpSessionConfiguration 을 통해서 만들어진 sessionRepository는 
SpringSessionRepositoryFilter 라는 빈에의해 참조된다. SpringSessionRepositoryFilter 빈은 JdbcHttpSessionConfiguration 에서 생성하기 때문에 JdbcHttpSessionConfiguration 에서 필터도 만들고, 필터에서 사용하는 sessionRepository 도 모두 만드는 셈이 된다. 여기까지 다 만들면 되는게 아니라, 이제 실제 톰캣의 필터에 이 springSessionRepositoryFilter 를 등록시켜주어야 한다. 스프링 시큐리티 처럼 springSessionRepositoryFilter 역시 스프링 기반의 필터이기 때문에 스프링 의존성을 갖는다. 그렇다면 당연히 뭐겠는가? 가이드에도 나와있듯이 DelegatingFilterProxy 를 감싸서 필터를 서블릿 컨테이너(톰캣)에 등록시켜주면 된다. 

```
<filter>
	<filter-name>springSessionRepositoryFilter</filter-name>
	<filter-class>org.springframework.web.filter.DelegatingFilterProxy</filter-class>
</filter>
<filter-mapping>
	<filter-name>springSessionRepositoryFilter</filter-name>
	<url-pattern>/*</url-pattern>
	<dispatcher>REQUEST</dispatcher>
	<dispatcher>ERROR</dispatcher>
</filter-mapping>
```

```
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xmlns:jdbc="http://www.springframework.org/schema/jdbc"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans-3.1.xsd http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context.xsd http://www.springframework.org/schema/jdbc http://www.springframework.org/schema/jdbc/spring-jdbc.xsd">

    <context:annotation-config/>
    <bean class="org.springframework.session.jdbc.config.annotation.web.http.JdbcHttpSessionConfiguration"/>



    <bean class="com.glqdlt.ex.configuration.datasource.SomeDataSourceConfig">

    </bean>

<!-- SomeDataSourceConfig 안에 sessionDataSource 가 있다 -->
    <bean name="sessionTxm" class="org.springframework.jdbc.datasource.DataSourceTransactionManager">
        <constructor-arg ref="sessionDataSource"/>
    </bean>



</beans>

Datasource config 인 SomEDataSourceConfig 를 불러오게 했따.

```


아무리 was 끼리 세션 클러스터링을 했다고 하더라도, 하나의 도메인으로 묶이지 않으면 cookie 공유(접근)가 안되기 때문에 브라우저 내부에서 JESESSION ID 공유가 안되어서(정확히는 각 WAS 에 전달) SSO 가 동작하질 않는다.

방안으로 1,2 안을 고민했는 데 결국은 1안으로 진ㅇ행했다. 이유는 아래에서 서술

1안 

- http://webapp1.glqdlt.com
- http://webapp2.glqdlt.com

2안

- http://webapp.glqdlt.com/app1/
- http://webapp.glqdlt.com/app2/

차이점은 1안의 경우 각 was 에 직접적인 도메인을 매핑 하는 것이다. 2안의 경우 was 앞단에 웹 서버를 두고 리버스 프록시로 /app1 , /app2  path 를 기준으로 라우팅하는 것이다.

우선 리버스 프록시 자체는 간단하다.

nginx.conf 에서 아래처럼 location 셋팅만 해주면 된다.

```

#user  nobody;
worker_processes  1;

#error_log  logs/error.log;
#error_log  logs/error.log  notice;
#error_log  logs/error.log  info;

#pid        logs/nginx.pid;


events {
    worker_connections  1024;
}


http {
    include       mime.types;
    default_type  application/octet-stream;

    #log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
    #                  '$status $body_bytes_sent "$http_referer" '
    #                  '"$http_user_agent" "$http_x_forwarded_for"';

    #access_log  logs/access.log  main;

    sendfile        on;
    #tcp_nopush     on;

    #keepalive_timeout  0;
    keepalive_timeout  65;

    #gzip  on;

    server {
        listen       80;
        server_name  localhost;

        #charset koi8-r;

        #access_log  logs/host.access.log  main;

        location /app1/ {
            proxy_pass http://127.0.0.1:18080/;
        }


        location /app2/ {
            proxy_pass http://127.0.0.1:28080/;
        }
    
        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   html;
        }

    }

}

```

2안으로 하면 문제가 발생하는 데, 

1. 어플리케이션 소스 코드가 대부분 절대경로 이다.

    - ```<a href="/">메인으로</a>```

2. path 의 prefix 로 구분이 되기 때문에 각 웹 어플리케이션의 servlet context 를 / 에서 /app1 이나 /app2 로 수정해주어야 한다.


1의 경우에는 어떠한 것이냐면, 화면상에서는 리버스 프록시가 제대로 동작해서 http://~~~~/app1/ 로 화면이 표기되고 대시보드에 화면이 나오지만, css 나 js 와 같은 정적 파일을 비롯해서 모든 링크들이 절대경로이기에 http:/----/app1/main.js 로 요청이 안 되고, http://---/main.js 로 요청이 되어버린다. 요청도 문제지만, app1 이나 app2 모두 http://---/main.js 로 똑같이 요청이 되어버리기 떄문에 이게 app1 의 js 인지 app2 의 js인지를 알 수가 없다.

2의 경우는 웹 어플리케이션 내부의 문제이다. 1의 경우를 상대 경로로 수정을 하더라도, 모든 컨트롤러에서 매핑 되는 context path 는 "/" 기준이다. 예를 들어 유저 조회의 기능이 아래와 같은 api 를 제공한다면

http://```/api/user/test-user/detail

상대 경로에서 요청이 될 떄에는 

http://```/app1/api/user/test-user/detail 로 오기 때문에 각 컨트롤러 매핑을 수정해주거나, /** 로 오는 것을 /app1 로 forward(dispatch) 할 수 있게 서블릿 필터를 준비해주어야 한다.

