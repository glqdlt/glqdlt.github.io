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



## SSO 아키텍처

SSO 아키텍처를 하기 위한 필수 전제 조건은 쿠키공유를 위해서 도메인을 묶어야 한다는 점이다. 자세한 것은 추후에 서술하겠다.

1. oauth2 기반의 sso [spring-security-oauth2](https://www.baeldung.com/sso-spring-security-oauth2)

    - 용도 : Oauth2 인가 프로토콜을 통해 개인정보를 보안하고, 로그인 처리와 같은 인증 대행을 위탁하는 형태

    - 장점 : 이기종 간의 SSO 구성이 쉽다. 디바이스 플랫폼 무관하게 같은 인증 대행을 처리할 수 있다. (단, PC 화면으로 로그인하고 모바일 어플리케이션으로 이미 로그인 된 세션으로 진입할수 는 없다. 토큰을 전달할 방법이 없기 때문이다.)

    - 단점 : 토큰 관리를 고려해야 한다. 간단히 in memory 구성으로 해도 되지만, 전문적으로 하게 되는 경우, 유저가 늘어나거나 리소스 서버가 확장되어서 토큰 핸들링이 필요해질 경우나 Auth server 를 클러스터링할 경우에는 토큰 공유를 위해 token store 를 관리할 주체가 필요해진다. 세션 클러스터링과 달리 무결성 토큰에 의존하게 되기 떄문에 세션을 확장하거나 전파가 필요한 경우 어플리케이션 끼리 공유할 수가 없다. 이것을 해결하기 위해서는 토큰을 key 로 두고 추가 데이터를 토큰 발행시에 추가 리소스를 인증 서버에서 데이터를 담아주어야 한다. 데이터가 노출 될 위험이 있기에 토큰에 직접적으로 삽입하기는 힘들고, 토큰 응답 바디에 추가적으로 데이터를 담아두고 클라이언트가 해당 추가 데이터만 consume 하는 식으로 처리를 해야 한다.
    서버사이드 기반이라면 로그인 된 A에서 로그인 하지 않은 B 라는 웹 서비스 이동 시에, B에서 최초 요청 시에 쿠키를 뒤져서 토큰을 가져오는 식의 사전 처리를 해야 한다. 이후 토큰이 발견되지 않을 시에는 

2. 공유하는 특정 로그인 페이지를 두고, 세션 클러스터링을 통한 WAS 통합

    - 용도 : 본 용도는 WAS 클러스터링과 같은 스케일 아웃 시에 고려해야할 모델이다.

    - 장점 : 세션 속성(attribute)에 세션 자료구조를 확장할 수 있으며, 확장 된 데이터는 모든 WAS에 전파(공유)가 가능해진다는 점이 있다.

    - 단점 : 특정 기술 스택에 커플링이 심해진다는 점이 있다. 이게 무슨말이냐면 클러스터링 아키텍처가 자바 기준이라면 자바와 파이썬간의 이기종 결합이 불가능하다.

1안이든 2안이든, 특정 화면에 바로가기 버튼을 두고 해당 버튼에 쿠키 데이터를 사용자 몰래 덧붙여서 이동시켜주지 않는 이상은 유저가 자유롭게 한 브라우저 윈도우(프로세스)에서 다른 웹 서비스로 이동을 하기 위해서는 서브 도메인으로 묶어 쿠키가 자동으로 리퀘스트에 덧붙여지거나, 자바스크립트가 상위 도메인의 로컬스토리지에 접근할 수 있게끔 해주어야 한다. (하위에서 상위 도메인으로 접근하는 방안은 iframe 을 이용한 꼼수가 있다.)

참고로 로컬스토리지는 도메인 별로 용량 제약을 같이 공유 받게 되는 데, 기본적으로 모바일은 2.5mb, 데스크탑은 10mb 정도로 제한 받는다.

일반적으로 utf-8 기준의 문자 길이가 3바이트인 경우는 쿠키에서 문자를 180글자까지만 받을 수 있다.

자세한 것은 [http://browsercookielimits.squawky.net/](http://browsercookielimits.squawky.net/) 참조


자바에서 1안이든 2안이든 [CookieSerializer](https://docs.spring.io/spring-session/docs/current/api/) 를 만들어서 sessionRepositoryFilter 에 셋팅해주어야 한다. 그래야지 jsessionId 가 상위 도메인의 쿠키에 담기게 된다.



재직 중인 엉터리 SSO 에서 JessionId와 토큰을 공유하지 않는 데 어떻게 SSO 이 되는걸까를 고민했엇다.

스프링 시큐리티 oauth2 기반의 sso 를 [가이드](https://www.baeldung.com/sso-spring-security-oauth2)를 보고 실마리를 찾았는 데, 이유는 이러하다.

[Oauth2ClientContext](https://docs.spring.io/spring-security/oauth/apidocs/org/springframework/security/oauth2/client/OAuth2ClientContext.html) 를 보면 상태 저장에 관련 된 메소드가 ```setPreservedState()``` 나온다.

이 메소드는 Oauth2RestTemplate 에서 호출이 되면서 stateKey 를 넘겨 받는다. 이 stateKey 는 UserRedirectRequiredException 에 포함되어 있다.

```java
	/**
	 * Acquire or renew an access token for the current context if necessary. This method will be called automatically
	 * when a request is executed (and the result is cached), but can also be called as a standalone method to
	 * pre-populate the token.
	 * 
	 * @return an access token
	 */
	public OAuth2AccessToken getAccessToken() throws UserRedirectRequiredException {

		OAuth2AccessToken accessToken = context.getAccessToken();

		if (accessToken == null || accessToken.isExpired()) {
			try {
				accessToken = acquireAccessToken(context);
			}
			catch (UserRedirectRequiredException e) {
				context.setAccessToken(null); // No point hanging onto it now
				accessToken = null;
				String stateKey = e.getStateKey();
				if (stateKey != null) {
					Object stateToPreserve = e.getStateToPreserve();
					if (stateToPreserve == null) {
						stateToPreserve = "NONE";
					}
					context.setPreservedState(stateKey, stateToPreserve);
				}
				throw e;
			}
		}
		return accessToken;
	}
```

위에서 보면 알겠지만 포인트가 stateKey와 stateToPreserve 이다. stateKey 는 저장 세션을 의미하고, stateToPreserve 는 계속 유지되어야 할 상태를 의미한다.

Oauth 인증 서버에서도 리소스서버에서도 클라이언트에서도 setPreservedState 가 담기는 context 를 사용한다. 이 녀석은  Oauth2RestTemplate 에 포함된 메소드 ``` getOAuth2ClientContext()```에서 리턴한다.
```
package org.springframework.security.oauth2.client;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URLEncoder;
import java.util.Arrays;

import org.springframework.http.HttpMethod;
import org.springframework.http.client.ClientHttpRequest;
import org.springframework.security.oauth2.client.http.AccessTokenRequiredException;
import org.springframework.security.oauth2.client.http.OAuth2ErrorHandler;
import org.springframework.security.oauth2.client.resource.OAuth2AccessDeniedException;
import org.springframework.security.oauth2.client.resource.OAuth2ProtectedResourceDetails;
import org.springframework.security.oauth2.client.resource.UserRedirectRequiredException;
import org.springframework.security.oauth2.client.token.AccessTokenProvider;
import org.springframework.security.oauth2.client.token.AccessTokenProviderChain;
import org.springframework.security.oauth2.client.token.AccessTokenRequest;
import org.springframework.security.oauth2.client.token.grant.client.ClientCredentialsAccessTokenProvider;
import org.springframework.security.oauth2.client.token.grant.code.AuthorizationCodeAccessTokenProvider;
import org.springframework.security.oauth2.client.token.grant.implicit.ImplicitAccessTokenProvider;
import org.springframework.security.oauth2.client.token.grant.password.ResourceOwnerPasswordAccessTokenProvider;
import org.springframework.security.oauth2.common.AuthenticationScheme;
import org.springframework.security.oauth2.common.OAuth2AccessToken;
import org.springframework.security.oauth2.common.exceptions.InvalidTokenException;
import org.springframework.web.client.RequestCallback;
import org.springframework.web.client.ResponseErrorHandler;
import org.springframework.web.client.ResponseExtractor;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

/**
 * Rest template that is able to make OAuth2-authenticated REST requests with the credentials of the provided resource.
 * 
 * @author Ryan Heaton
 * @author Dave Syer
 */
public class OAuth2RestTemplate extends RestTemplate implements OAuth2RestOperations {

	private final OAuth2ProtectedResourceDetails resource;

	private AccessTokenProvider accessTokenProvider = new AccessTokenProviderChain(Arrays.<AccessTokenProvider> asList(
			new AuthorizationCodeAccessTokenProvider(), new ImplicitAccessTokenProvider(),
			new ResourceOwnerPasswordAccessTokenProvider(), new ClientCredentialsAccessTokenProvider()));

	private OAuth2ClientContext context;

	private boolean retryBadAccessTokens = true;

	private OAuth2RequestAuthenticator authenticator = new DefaultOAuth2RequestAuthenticator();

	public OAuth2RestTemplate(OAuth2ProtectedResourceDetails resource) {
		this(resource, new DefaultOAuth2ClientContext());
	}

	public OAuth2RestTemplate(OAuth2ProtectedResourceDetails resource, OAuth2ClientContext context) {
		super();
		if (resource == null) {
			throw new IllegalArgumentException("An OAuth2 resource must be supplied.");
		}

		this.resource = resource;
		this.context = context;
		setErrorHandler(new OAuth2ErrorHandler(resource));
	}

	/**
	 * Strategy for extracting an Authorization header from an access token and the request details. Defaults to the
	 * simple form "TOKEN_TYPE TOKEN_VALUE".
	 * 
	 * @param authenticator the authenticator to use
	 */
	public void setAuthenticator(OAuth2RequestAuthenticator authenticator) {
		this.authenticator = authenticator;
	}

	/**
	 * Flag to determine whether a request that has an existing access token, and which then leads to an
	 * AccessTokenRequiredException should be retried (immediately, once). Useful if the remote server doesn't recognize
	 * an old token which is stored in the client, but is happy to re-grant it.
	 * 
	 * @param retryBadAccessTokens the flag to set (default true)
	 */
	public void setRetryBadAccessTokens(boolean retryBadAccessTokens) {
		this.retryBadAccessTokens = retryBadAccessTokens;
	}

	@Override
	public void setErrorHandler(ResponseErrorHandler errorHandler) {
		if (!(errorHandler instanceof OAuth2ErrorHandler)) {
			errorHandler = new OAuth2ErrorHandler(errorHandler, resource);
		}
		super.setErrorHandler(errorHandler);
	}
	
	@Override
	public OAuth2ProtectedResourceDetails getResource() {
		return resource;
	}

	@Override
	protected ClientHttpRequest createRequest(URI uri, HttpMethod method) throws IOException {

		OAuth2AccessToken accessToken = getAccessToken();

		AuthenticationScheme authenticationScheme = resource.getAuthenticationScheme();
		if (AuthenticationScheme.query.equals(authenticationScheme)
				|| AuthenticationScheme.form.equals(authenticationScheme)) {
			uri = appendQueryParameter(uri, accessToken);
		}

		ClientHttpRequest req = super.createRequest(uri, method);

		if (AuthenticationScheme.header.equals(authenticationScheme)) {
			authenticator.authenticate(resource, getOAuth2ClientContext(), req);
		}
		return req;

	}

	@Override
	protected <T> T doExecute(URI url, HttpMethod method, RequestCallback requestCallback,
			ResponseExtractor<T> responseExtractor) throws RestClientException {
		OAuth2AccessToken accessToken = context.getAccessToken();
		RuntimeException rethrow = null;
		try {
			return super.doExecute(url, method, requestCallback, responseExtractor);
		}
		catch (AccessTokenRequiredException e) {
			rethrow = e;
		}
		catch (OAuth2AccessDeniedException e) {
			rethrow = e;
		}
		catch (InvalidTokenException e) {
			// Don't reveal the token value in case it is logged
			rethrow = new OAuth2AccessDeniedException("Invalid token for client=" + getClientId());
		}
		if (accessToken != null && retryBadAccessTokens) {
			context.setAccessToken(null);
			try {
				return super.doExecute(url, method, requestCallback, responseExtractor);
			}
			catch (InvalidTokenException e) {
				// Don't reveal the token value in case it is logged
				rethrow = new OAuth2AccessDeniedException("Invalid token for client=" + getClientId());
			}
		}
		throw rethrow;
	}

	/**
	 * @return the client id for this resource.
	 */
	private String getClientId() {
		return resource.getClientId();
	}

	/**
	 * Acquire or renew an access token for the current context if necessary. This method will be called automatically
	 * when a request is executed (and the result is cached), but can also be called as a standalone method to
	 * pre-populate the token.
	 * 
	 * @return an access token
	 */
	public OAuth2AccessToken getAccessToken() throws UserRedirectRequiredException {

		OAuth2AccessToken accessToken = context.getAccessToken();

		if (accessToken == null || accessToken.isExpired()) {
			try {
				accessToken = acquireAccessToken(context);
			}
			catch (UserRedirectRequiredException e) {
				context.setAccessToken(null); // No point hanging onto it now
				accessToken = null;
				String stateKey = e.getStateKey();
				if (stateKey != null) {
					Object stateToPreserve = e.getStateToPreserve();
					if (stateToPreserve == null) {
						stateToPreserve = "NONE";
					}
					context.setPreservedState(stateKey, stateToPreserve);
				}
				throw e;
			}
		}
		return accessToken;
	}

	/**
	 * @return the context for this template
	 */
	public OAuth2ClientContext getOAuth2ClientContext() {
		return context;
	}

	protected OAuth2AccessToken acquireAccessToken(OAuth2ClientContext oauth2Context)
			throws UserRedirectRequiredException {

		AccessTokenRequest accessTokenRequest = oauth2Context.getAccessTokenRequest();
		if (accessTokenRequest == null) {
			throw new AccessTokenRequiredException(
					"No OAuth 2 security context has been established. Unable to access resource '"
							+ this.resource.getId() + "'.", resource);
		}

		// Transfer the preserved state from the (longer lived) context to the current request.
		String stateKey = accessTokenRequest.getStateKey();
		if (stateKey != null) {
			accessTokenRequest.setPreservedState(oauth2Context.removePreservedState(stateKey));
		}

		OAuth2AccessToken existingToken = oauth2Context.getAccessToken();
		if (existingToken != null) {
			accessTokenRequest.setExistingToken(existingToken);
		}

		OAuth2AccessToken accessToken = null;
		accessToken = accessTokenProvider.obtainAccessToken(resource, accessTokenRequest);
		if (accessToken == null || accessToken.getValue() == null) {
			throw new IllegalStateException(
					"Access token provider returned a null access token, which is illegal according to the contract.");
		}
		oauth2Context.setAccessToken(accessToken);
		return accessToken;
	}

	protected URI appendQueryParameter(URI uri, OAuth2AccessToken accessToken) {

		try {

			// TODO: there is some duplication with UriUtils here. Probably unavoidable as long as this
			// method signature uses URI not String.
			String query = uri.getRawQuery(); // Don't decode anything here
			String queryFragment = resource.getTokenName() + "=" + URLEncoder.encode(accessToken.getValue(), "UTF-8");
			if (query == null) {
				query = queryFragment;
			}
			else {
				query = query + "&" + queryFragment;
			}

			// first form the URI without query and fragment parts, so that it doesn't re-encode some query string chars
			// (SECOAUTH-90)
			URI update = new URI(uri.getScheme(), uri.getUserInfo(), uri.getHost(), uri.getPort(), uri.getPath(), null,
					null);
			// now add the encoded query string and the then fragment
			StringBuffer sb = new StringBuffer(update.toString());
			sb.append("?");
			sb.append(query);
			if (uri.getFragment() != null) {
				sb.append("#");
				sb.append(uri.getFragment());
			}

			return new URI(sb.toString());

		}
		catch (URISyntaxException e) {
			throw new IllegalArgumentException("Could not parse URI", e);
		}
		catch (UnsupportedEncodingException e) {
			throw new IllegalArgumentException("Could not encode URI", e);
		}

	}

	public void setAccessTokenProvider(AccessTokenProvider accessTokenProvider) {
		this.accessTokenProvider = accessTokenProvider;
	}

}

```

client context 를 받는 것은 UserInfoTokenServices 와 ClientRestTemplate 이다. 이 context가 클라이언트에서 http request 에 실리게 되는 자료구조가 된다. 마찬가지로 server에서도 해당 context 에서 데이터를 꺼내고, access Token 이 있는 지, 저장 된 state 인지를 체크한다. 마치 gRPC의 protoBuf 의 model 같이  쓰는 것이다.

SSO 이 되고 있는 stateKey 가 핵심인데, 이 stateKey 는 같은 브라우저에서 접근하기만 하면 어떻게든 똑같은 난수가 만들어진다. 그래서 jessessionID 나 토큰을 공유하지 않아도 SSO 처럼 돌아가는 것이다.

[DefaultOauth2ClientContext](https://docs.spring.io/spring-security/oauth/apidocs/org/springframework/security/oauth2/client/DefaultOAuth2ClientContext.html) 설명에서 setPreservedState() 를 보면 이해할 수가 있다.

나의 이 내용은 https://stackoverflow.com/questions/33006234/spring-security-oauth2-invalidate-session-after-authentication

에서 비슷한 질문이 있어 여기를 참고하길 바란다.


관련된 내용은 실제로 이슈로 등록되어 있다.

https://github.com/spring-projects/spring-security-oauth/issues/140


망각한게 있는데 톰켓에서 만드는 session 즉 jSessionId 는 httpSession 이고 스프링시큐리티에서 인증 성공이 되면 만드는 세션은 springSession 이다. 두개는 엄연히 차이가 있다.

실제로 스프링 세션 jdbc 에서 데이터 베이스 스키마를 보면 PRIMARY_ID 와 SESSION_ID 라는 두개의 필드가 존재하는 걸 볼 수가 있따.

https://stackoverflow.com/questions/29479840/spring-session-and-spring-security


https://docs.spring.io/spring-session/docs/current/reference/html5/#httpsession

http session 이 spring session 으로 통합될 것이란 걸 개발자는 몰라도 된다. 단순히 http session 을 가지고 와서 핸들링하면 이게 spring session 으로 변활될지 말지는 신경쓰지 말라는 의미이다. 즉, 2개는 다르다. 

UserRedirectRequiredException 이 녀석이 아주 골 떄리는데 내용이 굉장히 웃기다.

Special exception thrown when a user redirect is required in order to obtain an OAuth2 access token.

즉 예외를 예외처럼 쓰지 않는 녀석이다.

## Oauth2 플로우

client 의 필터를 타고 요청을 해야한다고 판단하면 AuthorizationEndpoint.authorize() 로 이동하게 된다.

이 녀석은 	@RequestMapping(value = "/oauth/authorize") 로 되어있는 녀석이다.

```java

/*
 * Copyright 2002-2011 the original author or authors.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

package org.springframework.security.oauth2.provider.endpoint;

import java.net.URI;
import java.security.Principal;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.InsufficientAuthenticationException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.common.OAuth2AccessToken;
import org.springframework.security.oauth2.common.exceptions.BadClientCredentialsException;
import org.springframework.security.oauth2.common.exceptions.ClientAuthenticationException;
import org.springframework.security.oauth2.common.exceptions.InvalidClientException;
import org.springframework.security.oauth2.common.exceptions.InvalidRequestException;
import org.springframework.security.oauth2.common.exceptions.OAuth2Exception;
import org.springframework.security.oauth2.common.exceptions.RedirectMismatchException;
import org.springframework.security.oauth2.common.exceptions.UnapprovedClientAuthenticationException;
import org.springframework.security.oauth2.common.exceptions.UnsupportedResponseTypeException;
import org.springframework.security.oauth2.common.exceptions.UserDeniedAuthorizationException;
import org.springframework.security.oauth2.common.util.OAuth2Utils;
import org.springframework.security.oauth2.provider.AuthorizationRequest;
import org.springframework.security.oauth2.provider.ClientDetails;
import org.springframework.security.oauth2.provider.ClientRegistrationException;
import org.springframework.security.oauth2.provider.OAuth2Authentication;
import org.springframework.security.oauth2.provider.OAuth2Request;
import org.springframework.security.oauth2.provider.OAuth2RequestValidator;
import org.springframework.security.oauth2.provider.TokenRequest;
import org.springframework.security.oauth2.provider.approval.DefaultUserApprovalHandler;
import org.springframework.security.oauth2.provider.approval.UserApprovalHandler;
import org.springframework.security.oauth2.provider.code.AuthorizationCodeServices;
import org.springframework.security.oauth2.provider.code.InMemoryAuthorizationCodeServices;
import org.springframework.security.oauth2.provider.implicit.ImplicitTokenRequest;
import org.springframework.security.oauth2.provider.request.DefaultOAuth2RequestValidator;
import org.springframework.util.StringUtils;
import org.springframework.web.HttpSessionRequiredException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.SessionAttributes;
import org.springframework.web.bind.support.DefaultSessionAttributeStore;
import org.springframework.web.bind.support.SessionAttributeStore;
import org.springframework.web.bind.support.SessionStatus;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.View;
import org.springframework.web.servlet.view.RedirectView;
import org.springframework.web.util.UriComponents;
import org.springframework.web.util.UriComponentsBuilder;

/**
 * <p>
 * Implementation of the Authorization Endpoint from the OAuth2 specification. Accepts authorization requests, and
 * handles user approval if the grant type is authorization code. The tokens themselves are obtained from the
 * {@link TokenEndpoint Token Endpoint}, except in the implicit grant type (where they come from the Authorization
 * Endpoint via <code>response_type=token</code>.
 * </p>
 * 
 * <p>
 * This endpoint should be secured so that it is only accessible to fully authenticated users (as a minimum requirement)
 * since it represents a request from a valid user to act on his or her behalf.
 * </p>
 * 
 * @author Dave Syer
 * @author Vladimir Kryachko
 * 
 */
@FrameworkEndpoint
@SessionAttributes("authorizationRequest")
public class AuthorizationEndpoint extends AbstractEndpoint {

	private AuthorizationCodeServices authorizationCodeServices = new InMemoryAuthorizationCodeServices();

	private RedirectResolver redirectResolver = new DefaultRedirectResolver();

	private UserApprovalHandler userApprovalHandler = new DefaultUserApprovalHandler();

	private SessionAttributeStore sessionAttributeStore = new DefaultSessionAttributeStore();

	private OAuth2RequestValidator oauth2RequestValidator = new DefaultOAuth2RequestValidator();

	private String userApprovalPage = "forward:/oauth/confirm_access";

	private String errorPage = "forward:/oauth/error";

	private Object implicitLock = new Object();

	public void setSessionAttributeStore(SessionAttributeStore sessionAttributeStore) {
		this.sessionAttributeStore = sessionAttributeStore;
	}

	public void setErrorPage(String errorPage) {
		this.errorPage = errorPage;
	}

	@RequestMapping(value = "/oauth/authorize")
	public ModelAndView authorize(Map<String, Object> model, @RequestParam Map<String, String> parameters,
			SessionStatus sessionStatus, Principal principal) {

		// Pull out the authorization request first, using the OAuth2RequestFactory. All further logic should
		// query off of the authorization request instead of referring back to the parameters map. The contents of the
		// parameters map will be stored without change in the AuthorizationRequest object once it is created.
		AuthorizationRequest authorizationRequest = getOAuth2RequestFactory().createAuthorizationRequest(parameters);

		Set<String> responseTypes = authorizationRequest.getResponseTypes();

		if (!responseTypes.contains("token") && !responseTypes.contains("code")) {
			throw new UnsupportedResponseTypeException("Unsupported response types: " + responseTypes);
		}

		if (authorizationRequest.getClientId() == null) {
			throw new InvalidClientException("A client id must be provided");
		}

		try {

			if (!(principal instanceof Authentication) || !((Authentication) principal).isAuthenticated()) {
				throw new InsufficientAuthenticationException(
						"User must be authenticated with Spring Security before authorization can be completed.");
			}

			ClientDetails client = getClientDetailsService().loadClientByClientId(authorizationRequest.getClientId());

			// The resolved redirect URI is either the redirect_uri from the parameters or the one from
			// clientDetails. Either way we need to store it on the AuthorizationRequest.
			String redirectUriParameter = authorizationRequest.getRequestParameters().get(OAuth2Utils.REDIRECT_URI);
			String resolvedRedirect = redirectResolver.resolveRedirect(redirectUriParameter, client);
			if (!StringUtils.hasText(resolvedRedirect)) {
				throw new RedirectMismatchException(
						"A redirectUri must be either supplied or preconfigured in the ClientDetails");
			}
			authorizationRequest.setRedirectUri(resolvedRedirect);

			// We intentionally only validate the parameters requested by the client (ignoring any data that may have
			// been added to the request by the manager).
			oauth2RequestValidator.validateScope(authorizationRequest, client);

			// Some systems may allow for approval decisions to be remembered or approved by default. Check for
			// such logic here, and set the approved flag on the authorization request accordingly.
			authorizationRequest = userApprovalHandler.checkForPreApproval(authorizationRequest,
					(Authentication) principal);
			// TODO: is this call necessary?
			boolean approved = userApprovalHandler.isApproved(authorizationRequest, (Authentication) principal);
			authorizationRequest.setApproved(approved);

			// Validation is all done, so we can check for auto approval...
			if (authorizationRequest.isApproved()) {
				if (responseTypes.contains("token")) {
					return getImplicitGrantResponse(authorizationRequest);
				}
				if (responseTypes.contains("code")) {
					return new ModelAndView(getAuthorizationCodeResponse(authorizationRequest,
							(Authentication) principal));
				}
			}

			// Place auth request into the model so that it is stored in the session
			// for approveOrDeny to use. That way we make sure that auth request comes from the session,
			// so any auth request parameters passed to approveOrDeny will be ignored and retrieved from the session.
			model.put("authorizationRequest", authorizationRequest);

			return getUserApprovalPageResponse(model, authorizationRequest, (Authentication) principal);

		}
		catch (RuntimeException e) {
			sessionStatus.setComplete();
			throw e;
		}

	}

	@RequestMapping(value = "/oauth/authorize", method = RequestMethod.POST, params = OAuth2Utils.USER_OAUTH_APPROVAL)
	public View approveOrDeny(@RequestParam Map<String, String> approvalParameters, Map<String, ?> model,
			SessionStatus sessionStatus, Principal principal) {

		if (!(principal instanceof Authentication)) {
			sessionStatus.setComplete();
			throw new InsufficientAuthenticationException(
					"User must be authenticated with Spring Security before authorizing an access token.");
		}

		AuthorizationRequest authorizationRequest = (AuthorizationRequest) model.get("authorizationRequest");

		if (authorizationRequest == null) {
			sessionStatus.setComplete();
			throw new InvalidRequestException("Cannot approve uninitialized authorization request.");
		}

		try {
			Set<String> responseTypes = authorizationRequest.getResponseTypes();

			authorizationRequest.setApprovalParameters(approvalParameters);
			authorizationRequest = userApprovalHandler.updateAfterApproval(authorizationRequest,
					(Authentication) principal);
			boolean approved = userApprovalHandler.isApproved(authorizationRequest, (Authentication) principal);
			authorizationRequest.setApproved(approved);

			if (authorizationRequest.getRedirectUri() == null) {
				sessionStatus.setComplete();
				throw new InvalidRequestException("Cannot approve request when no redirect URI is provided.");
			}

			if (!authorizationRequest.isApproved()) {
				return new RedirectView(getUnsuccessfulRedirect(authorizationRequest,
						new UserDeniedAuthorizationException("User denied access"), responseTypes.contains("token")),
						false, true, false);
			}

			if (responseTypes.contains("token")) {
				return getImplicitGrantResponse(authorizationRequest).getView();
			}

			return getAuthorizationCodeResponse(authorizationRequest, (Authentication) principal);
		}
		finally {
			sessionStatus.setComplete();
		}

	}

	// We need explicit approval from the user.
	private ModelAndView getUserApprovalPageResponse(Map<String, Object> model,
			AuthorizationRequest authorizationRequest, Authentication principal) {
		logger.debug("Loading user approval page: " + userApprovalPage);
		model.putAll(userApprovalHandler.getUserApprovalRequest(authorizationRequest, principal));
		return new ModelAndView(userApprovalPage, model);
	}

	// We can grant a token and return it with implicit approval.
	private ModelAndView getImplicitGrantResponse(AuthorizationRequest authorizationRequest) {
		try {
			TokenRequest tokenRequest = getOAuth2RequestFactory().createTokenRequest(authorizationRequest, "implicit");
			OAuth2Request storedOAuth2Request = getOAuth2RequestFactory().createOAuth2Request(authorizationRequest);
			OAuth2AccessToken accessToken = getAccessTokenForImplicitGrant(tokenRequest, storedOAuth2Request);
			if (accessToken == null) {
				throw new UnsupportedResponseTypeException("Unsupported response type: token");
			}
			return new ModelAndView(new RedirectView(appendAccessToken(authorizationRequest, accessToken), false, true,
					false));
		}
		catch (OAuth2Exception e) {
			return new ModelAndView(new RedirectView(getUnsuccessfulRedirect(authorizationRequest, e, true), false,
					true, false));
		}
	}

	private OAuth2AccessToken getAccessTokenForImplicitGrant(TokenRequest tokenRequest,
			OAuth2Request storedOAuth2Request) {
		OAuth2AccessToken accessToken = null;
		// These 1 method calls have to be atomic, otherwise the ImplicitGrantService can have a race condition where
		// one thread removes the token request before another has a chance to redeem it.
		synchronized (this.implicitLock) {
			accessToken = getTokenGranter().grant("implicit",
					new ImplicitTokenRequest(tokenRequest, storedOAuth2Request));
		}
		return accessToken;
	}

	private View getAuthorizationCodeResponse(AuthorizationRequest authorizationRequest, Authentication authUser) {
		try {
			return new RedirectView(getSuccessfulRedirect(authorizationRequest,
					generateCode(authorizationRequest, authUser)), false, true, false);
		}
		catch (OAuth2Exception e) {
			return new RedirectView(getUnsuccessfulRedirect(authorizationRequest, e, false), false, true, false);
		}
	}

	private String appendAccessToken(AuthorizationRequest authorizationRequest, OAuth2AccessToken accessToken) {

		Map<String, Object> vars = new LinkedHashMap<String, Object>();
		Map<String, String> keys = new HashMap<String, String>();

		if (accessToken == null) {
			throw new InvalidRequestException("An implicit grant could not be made");
		}

		vars.put("access_token", accessToken.getValue());
		vars.put("token_type", accessToken.getTokenType());
		String state = authorizationRequest.getState();

		if (state != null) {
			vars.put("state", state);
		}
		Date expiration = accessToken.getExpiration();
		if (expiration != null) {
			long expires_in = (expiration.getTime() - System.currentTimeMillis()) / 1000;
			vars.put("expires_in", expires_in);
		}
		String originalScope = authorizationRequest.getRequestParameters().get(OAuth2Utils.SCOPE);
		if (originalScope == null || !OAuth2Utils.parseParameterList(originalScope).equals(accessToken.getScope())) {
			vars.put("scope", OAuth2Utils.formatParameterList(accessToken.getScope()));
		}
		Map<String, Object> additionalInformation = accessToken.getAdditionalInformation();
		for (String key : additionalInformation.keySet()) {
			Object value = additionalInformation.get(key);
			if (value != null) {
				keys.put("extra_" + key, key);
				vars.put("extra_" + key, value);
			}
		}
		// Do not include the refresh token (even if there is one)
		return append(authorizationRequest.getRedirectUri(), vars, keys, true);
	}

	private String generateCode(AuthorizationRequest authorizationRequest, Authentication authentication)
			throws AuthenticationException {

		try {

			OAuth2Request storedOAuth2Request = getOAuth2RequestFactory().createOAuth2Request(authorizationRequest);

			OAuth2Authentication combinedAuth = new OAuth2Authentication(storedOAuth2Request, authentication);
			String code = authorizationCodeServices.createAuthorizationCode(combinedAuth);

			return code;

		}
		catch (OAuth2Exception e) {

			if (authorizationRequest.getState() != null) {
				e.addAdditionalInformation("state", authorizationRequest.getState());
			}

			throw e;

		}
	}

	private String getSuccessfulRedirect(AuthorizationRequest authorizationRequest, String authorizationCode) {

		if (authorizationCode == null) {
			throw new IllegalStateException("No authorization code found in the current request scope.");
		}

		Map<String, String> query = new LinkedHashMap<String, String>();
		query.put("code", authorizationCode);

		String state = authorizationRequest.getState();
		if (state != null) {
			query.put("state", state);
		}

		return append(authorizationRequest.getRedirectUri(), query, false);
	}

	private String getUnsuccessfulRedirect(AuthorizationRequest authorizationRequest, OAuth2Exception failure,
			boolean fragment) {

		if (authorizationRequest == null || authorizationRequest.getRedirectUri() == null) {
			// we have no redirect for the user. very sad.
			throw new UnapprovedClientAuthenticationException("Authorization failure, and no redirect URI.", failure);
		}

		Map<String, String> query = new LinkedHashMap<String, String>();

		query.put("error", failure.getOAuth2ErrorCode());
		query.put("error_description", failure.getMessage());

		if (authorizationRequest.getState() != null) {
			query.put("state", authorizationRequest.getState());
		}

		if (failure.getAdditionalInformation() != null) {
			for (Map.Entry<String, String> additionalInfo : failure.getAdditionalInformation().entrySet()) {
				query.put(additionalInfo.getKey(), additionalInfo.getValue());
			}
		}

		return append(authorizationRequest.getRedirectUri(), query, fragment);

	}

	private String append(String base, Map<String, ?> query, boolean fragment) {
		return append(base, query, null, fragment);
	}

	private String append(String base, Map<String, ?> query, Map<String, String> keys, boolean fragment) {

		UriComponentsBuilder template = UriComponentsBuilder.newInstance();
		UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(base);
		URI redirectUri;
		try {
			// assume it's encoded to start with (if it came in over the wire)
			redirectUri = builder.build(true).toUri();
		}
		catch (Exception e) {
			// ... but allow client registrations to contain hard-coded non-encoded values
			redirectUri = builder.build().toUri();
			builder = UriComponentsBuilder.fromUri(redirectUri);
		}
		template.scheme(redirectUri.getScheme()).port(redirectUri.getPort()).host(redirectUri.getHost())
				.userInfo(redirectUri.getUserInfo()).path(redirectUri.getPath());

		if (fragment) {
			StringBuilder values = new StringBuilder();
			if (redirectUri.getFragment() != null) {
				String append = redirectUri.getFragment();
				values.append(append);
			}
			for (String key : query.keySet()) {
				if (values.length() > 0) {
					values.append("&");
				}
				String name = key;
				if (keys != null && keys.containsKey(key)) {
					name = keys.get(key);
				}
				values.append(name + "={" + key + "}");
			}
			if (values.length() > 0) {
				template.fragment(values.toString());
			}
			UriComponents encoded = template.build().expand(query).encode();
			builder.fragment(encoded.getFragment());
		}
		else {
			for (String key : query.keySet()) {
				String name = key;
				if (keys != null && keys.containsKey(key)) {
					name = keys.get(key);
				}
				template.queryParam(name, "{" + key + "}");
			}
			template.fragment(redirectUri.getFragment());
			UriComponents encoded = template.build().expand(query).encode();
			builder.query(encoded.getQuery());
		}

		return builder.build().toUriString();

	}

	public void setUserApprovalPage(String userApprovalPage) {
		this.userApprovalPage = userApprovalPage;
	}

	public void setAuthorizationCodeServices(AuthorizationCodeServices authorizationCodeServices) {
		this.authorizationCodeServices = authorizationCodeServices;
	}

	public void setRedirectResolver(RedirectResolver redirectResolver) {
		this.redirectResolver = redirectResolver;
	}

	public void setUserApprovalHandler(UserApprovalHandler userApprovalHandler) {
		this.userApprovalHandler = userApprovalHandler;
	}

	public void setOAuth2RequestValidator(OAuth2RequestValidator oauth2RequestValidator) {
		this.oauth2RequestValidator = oauth2RequestValidator;
	}

	@SuppressWarnings("deprecation")
	public void setImplicitGrantService(
			org.springframework.security.oauth2.provider.implicit.ImplicitGrantService implicitGrantService) {
	}

	@ExceptionHandler(ClientRegistrationException.class)
	public ModelAndView handleClientRegistrationException(Exception e, ServletWebRequest webRequest) throws Exception {
		logger.info("Handling ClientRegistrationException error: " + e.getMessage());
		return handleException(new BadClientCredentialsException(), webRequest);
	}

	@ExceptionHandler(OAuth2Exception.class)
	public ModelAndView handleOAuth2Exception(OAuth2Exception e, ServletWebRequest webRequest) throws Exception {
		logger.info("Handling OAuth2 error: " + e.getSummary());
		return handleException(e, webRequest);
	}

	@ExceptionHandler(HttpSessionRequiredException.class)
	public ModelAndView handleHttpSessionRequiredException(HttpSessionRequiredException e, ServletWebRequest webRequest)
			throws Exception {
		logger.info("Handling Session required error: " + e.getMessage());
		return handleException(new AccessDeniedException("Could not obtain authorization request from session", e),
				webRequest);
	}

	private ModelAndView handleException(Exception e, ServletWebRequest webRequest) throws Exception {

		ResponseEntity<OAuth2Exception> translate = getExceptionTranslator().translate(e);
		webRequest.getResponse().setStatus(translate.getStatusCode().value());

		if (e instanceof ClientAuthenticationException || e instanceof RedirectMismatchException) {
			return new ModelAndView(errorPage, Collections.singletonMap("error", translate.getBody()));
		}

		AuthorizationRequest authorizationRequest = null;
		try {
			authorizationRequest = getAuthorizationRequestForError(webRequest);
			String requestedRedirectParam = authorizationRequest.getRequestParameters().get(OAuth2Utils.REDIRECT_URI);
			String requestedRedirect = redirectResolver.resolveRedirect(requestedRedirectParam,
					getClientDetailsService().loadClientByClientId(authorizationRequest.getClientId()));
			authorizationRequest.setRedirectUri(requestedRedirect);
			String redirect = getUnsuccessfulRedirect(authorizationRequest, translate.getBody(), authorizationRequest
					.getResponseTypes().contains("token"));
			return new ModelAndView(new RedirectView(redirect, false, true, false));
		}
		catch (OAuth2Exception ex) {
			// If an AuthorizationRequest cannot be created from the incoming parameters it must be
			// an error. OAuth2Exception can be handled this way. Other exceptions will generate a standard 500
			// response.
			return new ModelAndView(errorPage, Collections.singletonMap("error", translate.getBody()));
		}

	}

	private AuthorizationRequest getAuthorizationRequestForError(ServletWebRequest webRequest) {

		// If it's already there then we are in the approveOrDeny phase and we can use the saved request
		AuthorizationRequest authorizationRequest = (AuthorizationRequest) sessionAttributeStore.retrieveAttribute(
				webRequest, "authorizationRequest");
		if (authorizationRequest != null) {
			return authorizationRequest;
		}

		Map<String, String> parameters = new HashMap<String, String>();
		Map<String, String[]> map = webRequest.getParameterMap();
		for (String key : map.keySet()) {
			String[] values = map.get(key);
			if (values != null && values.length > 0) {
				parameters.put(key, values[0]);
			}
		}

		try {
			return getOAuth2RequestFactory().createAuthorizationRequest(parameters);
		}
		catch (Exception e) {
			return getDefaultOAuth2RequestFactory().createAuthorizationRequest(parameters);
		}

	}
}

```

여기서 authorize 는 Principal principal 를 파라미터로 받고 있는 데, 이 principal 이 auth server와 유저 브라우저 간의 세션이 맺혀있는 정보이다.

스프링 세션은 단일 브라우저에서 멀티 계정에 대한 접속을 허용한다고 했었다. 그거 때문에 현재 조직의 SSO가 동작하는 거 같다.

각 서비스 별로 별도의 로그아웃이 되기 때문이다.



인증 세션(principal) 과 등록된 토큰의 등록자와 비교한다.

알고봤더니

따로따로 로그아웃 되는 것의 문제를 알아냈다.

인증 서버에서는 로그아웃시에 로그인된 세션정보를 다 날리고, 그 세션의 인증자 principal.getUserName() 으로 유저명의로 등록된 토큰을 다 삭제한다.

당연히 A,B 서비스 모두 인증이 되지 않을것이라 생각하지만 각자 따로 로그아웃 되는 데 이는 인증서버에서 인증세션을 다 제거하고 토큰을 제거했지만, A B 개별적인 세션이 맺혀있고, 필터 순서가 1. 나에 대한 인증이 되었나? 2. oauth 인증에서 확인이 되었나? 로 보기때문에 1번에서 ok 되어 동작하는 것이었다.


로그아웃 시에는  LogoutFilter.doFilter() 가 호출되는데, 등록 된 로그아웃 핸들러들을 for 문 돌면서 실행시켜준다.


```java
public class SsoClientSecurityConfig extends WebSecurityConfigurerAdapter{

    @Override
    public void configure(HttpSecurity http) throws Exception {
        http
                .antMatcher("/**")
                .addFilterBefore( new RequestContextFilter(), BasicAuthenticationFilter.class)
                .addFilterBefore(new OAuth2ClientContextFilter(), BasicAuthenticationFilter.class)
                .addFilterBefore(new OAuth2ClientAuthenticationProcessingFilter(), BasicAuthenticationFilter.class)

                .authorizeRequests()
                .antMatchers("/denied").permitAll()
                .anyRequest().authenticated()
                .and()

                .logout()
                .addLogoutHandler(logoutHandler)
                .permitAll().and()
                .csrf().disable()
                .exceptionHandling()
                .authenticationEntryPoint(new LoginUrlAuthenticationEntryPoint(localOauth2EntryPoint));
    }

}

```

addFilterBefore() 를 주목해야는 데, BasicAuthenticationFilter 로 등록된 필터에 내부적으로 순서대로 호출된다.

스프링의 복합섹션 

https://docs.spring.io/spring-session/docs/1.3.4.RELEASE/reference/html5/guides/users.html

스프링의 세션이 만들어지는 순간에 대한 얘기는 [여기서](https://www.baeldung.com/spring-security-session) 찾을 수 있다.

```
2. When Is The Session Created?
We can control exactly when our session gets created and how Spring Security will interact with it:

always – a session will always be created if one doesn’t already exist
ifRequired – a session will be created only if required (default)
never – the framework will never create a session itself but it will use one if it already exists
stateless – no session will be created or used by Spring Security
1
<http create-session="ifRequired">...</http>
Java configuration:

1
2
3
4
5
@Override
protected void configure(HttpSecurity http) throws Exception {
    http.sessionManagement()
        .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
}
It’s very important to understand that this configuration only controls what Spring Security does – not the entire application. Spring Security may not create the session if we instruct it not to, but our app may!

By default, Spring Security will create a session when it needs one – this is “ifRequired“.

For a more stateless application, the “never” option will ensure that Spring Security itself will not create any session; however, if the application creates one, then Spring Security will make use of it.

Finally, the strictest session creation option – “stateless” – is a guarantee that the application will not create any session at all.

This was introduced in Spring 3.1 and will effectively skip parts of the Spring Security filter chain – mainly the session related parts such as HttpSessionSecurityContextRepository, SessionManagementFilter, RequestCacheFilter.

These more strict control mechanisms have the direct implication that cookies are not used and so each and every request needs to be re-authenticated. This stateless architecture plays well with REST APIs and their Statelessness constraint. They also work well with authentication mechanisms such as Basic and Digest Authentication.

```

여기서 주목할 것은
```
By default, Spring Security will create a session when it needs one – this is “ifRequired“.
```

이다. ifRequired 옵션은 세션 생성이 필요할 경우에 스프링 시큐리티 프레임워크에 의해 추가로 생성이 된다. 이게 스프링 시큐리티를 사용했을 때에 놀라운 일이 생기는 것인데, http session 즉 서블릿에서 관리되는 세션을 삭제하거나 cookie 에서 JsessionID 를 제거하여서 세션 누락을 인지시켜서 로그인 화면을 보이게 의도하더라도, 로그인을 한 인증 세션이었다면 스프링 프레임워크에 의해 새로운 세션이 만들어졌기 때문에 스프링 시큐리티 필터 체인에서 해당 세션이 인증 된 세션임을 인식할 수 있어서 이미 로그인 된 사용자인 것을 알고 있다.

이에 대해서는 여러가지 도움이 되는 부분이 있는 데, 세션 하이잭킹과 같은 공격에서 방어를 할 수 있는 이점이 있다.  그렇다면 기존 전통적인 세션 체킹을 위해 쿠키에 세션을 실어서 보내는 아키텍처를 뛰어넘는, 매 요청에 대해 같은 단일 브라우저에서 요청이 오는 것인지를 알 수가 있다는 것인데.. 세션 생성 매카니즘을 알고 싶어서 이리저리 뒤져봤지만 보이질 않았다.

https://stackoverflow.com/questions/2504590/how-can-i-use-spring-security-without-sessions

여기에 따르면 

```
Just a quick note: it's "create-session" rather than "create-sessions"

create-session

Controls the eagerness with which an HTTP session is created.

If not set, defaults to "ifRequired". Other options are "always" and "never".

The setting of this attribute affect the allowSessionCreation and forceEagerSessionCreation properties of HttpSessionContextIntegrationFilter. allowSessionCreation will always be true unless this attribute is set to "never". forceEagerSessionCreation is "false" unless it is set to "always".

So the default configuration allows session creation but does not force it. The exception is if concurrent session control is enabled, when forceEagerSessionCreation will be set to true, regardless of what the setting is here. Using "never" would then cause an exception during the initialization of HttpSessionContextIntegrationFilter.

For specific details of the session usage, there is some good documentation in the HttpSessionSecurityContextRepository javadoc.
```

```
Controls the eagerness with which an HTTP session is created. If not set, defaults to "ifRequired". Other options are "always" and "never". The setting of this attribute affect the allowSessionCreation and forceEagerSessionCreation properties of SecurityContextPersistenceFilter. allowSessionCreation will always be true unless this attribute is set to "never". forceEagerSessionCreation is "false" unless it is set to "always". So the default configuration allows session creation but does not force it. The exception is if concurrent session control is enabled, when forceEagerSessionCreation will be set to true, regardless of what the setting is here. Using "never" would then cause an exception during the initialization of SecurityContextPersistenceFilter.
```

[SecurityContetxtPersistenceFilter](https://docs.spring.io/spring-security/site/docs/4.2.12.RELEASE/apidocs/org/springframework/security/web/context/SecurityContextPersistenceFilter.html) 를 뒤져 보았다/.


```
This filter will only execute once per request, to resolve servlet container (specifically Weblogic) incompatibilities.
```

즉 내 예상 데로 서블릿 세션(HttpSession)과 달리 스프링 시큐리티에서 별도의 관리 세션을 만들며, 

```
This filter MUST be executed BEFORE any authentication processing mechanisms. Authentication processing mechanisms (e.g. BASIC, CAS processing filters etc) expect the SecurityContextHolder to contain a valid SecurityContext by the time they execute.
```

모든 필터의 사전에 최초로 요청이 되어지기 때문에, JessionID 를 삭제해서 세션 만료를 야기시키게 되어 서블릿에서 세션을 만들더라도 스프링 시큐리티 필터 체인의 최우선에서 보호된 세션임을 인지하게 되는 것이다.