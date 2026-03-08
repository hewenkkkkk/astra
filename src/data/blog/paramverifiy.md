---
title: "AOP参数校验"
description: "场景 在面试中，可能会问道AOP的适用场景有哪些，参数校验就是其中的一个例子 在Java使用登录or注册功能时，会需要用户提交邮箱手机号等信息，此时前端可能会做参数校验，以下代码是基于后端的参数校验，可适用于大部分场景。 功能 代码结构 核"
pubDatetime: 2023-05-23T10:28:04Z
tags:
  - Java实战
draft: false
---

# 场景

在面试中，可能会问道AOP的适用场景有哪些，参数校验就是其中的一个例子

在Java使用登录or注册功能时，会需要用户提交邮箱手机号等信息，此时前端可能会做参数校验，以下代码是基于后端的参数校验，可适用于大部分场景。

# 功能

## 代码结构

![](https://pic.lamper.top/wp/2023/05/c921f5f847a6.webp)

核心的代码在GlobalOperatcionAspect类中，通过反射获取到Controller中的参数值。

@Globallnterceptor：

全局注解，个人理解它可以管理其它的注解。

```java
@Target({ElementType.METHOD})
@Retention(java.lang.annotation.RetentionPolicy.RUNTIME)
@Mapping
public @interface Globallnterceptor {
    boolean checkParams() default false; //是否检查参数 默认不检查
}
```

@VerifyParam：

具体的参数校验注解，只有当@Globallnterceptor中的checkParams为true时才会初步生效。因为此注解中还有required为true时才是真正开启了参数校验。

```java
@Retention(java.lang.annotation.RetentionPolicy.RUNTIME)
@Target({ElementType.PARAMETER,ElementType.FIELD})
public @interface VerifyParam {

    int min() default -1;
    //最大长度
    int max() default -1;
    //是否必填
    boolean required() default false;
    //正则表达式校验
    VerifyRegexEnum regex() default VerifyRegexEnum.NO;
}
```

GlobalOperatcionAspect：

在此类中：

- 获取到方法的参数、方法名等……
- 检查@Globallnterceptor注解中的checkParams是否为true
- 若为true，则进行参数校验，反之则不校验
- validateParams()方法中，检查@VerifyParam注解的required是否为true
- 判断参数的类型，若为基本类型，则进入checkValue()方法判断，反之进入checkObjValue()方法

```java
@Aspect
@Component("globalOperatcionAspect")
public class GlobalOperatcionAspect {

    private static final Logger logger = LoggerFactory.getLogger(GlobalOperatcionAspect.class);
    private static final String[] TYPE_BASIS = {"java.lang.String","java.lang.Integer","java.lang.Long"
	,"java.lang.Double"};
//    private static final String TYPE_INTEGER = "java.lang.Integer";
//    private static final String TYPE_LONG = "java.lang.Long";

    @Pointcut("@annotation(com.easypan.annotation.Globallnterceptor)")
    private void requestInterceptor() {
    }

    @Before("requestInterceptor()")
    public void interceptorDo(JoinPoint point) throws BusinessException {
        try{
			//获取目标对象
            Object target = point.getTarget();
            //获取方法参数
            Object[] argements = point.getArgs();
            //获取方法名
            String methodName = point.getSignature().getName();
            //获取参数类型
            Class<?>[] parameterTypes = ((MethodSignature)point.getSignature()).getMethod().getParameterTypes();
			//反射获取该方法
            Method method = target.getClass().getMethod(methodName,parameterTypes);
			//获取 method 方法上的 Globallnterceptor 注解对象。如果该方法上没有该注解，
			//则返回 null。如果有注解，则可以通过注解对象来获取注解中定义的属性值
            Globallnterceptor interceptor = method.getAnnotation(Globallnterceptor.class);
            if (interceptor == null){
                return;
            }
            /**
             * 参数校验
             */
            if(interceptor.checkParams()){
                validateParams(method,argements);
            }
			//缺少一个全局异常
        }catch (BusinessException e){
			logger.error("参数校验失败",e);
			throw new BusinessException(ResponseCodeEnum.CODE_500);
		}catch (Throwable e){
			logger.error("参数校验失败",e);
			throw new BusinessException(ResponseCodeEnum.CODE_500);
		}
	}

	/**
	 * 用于判断校验的具体类型
	 * @param method
	 * @param argements
	 */
    private void validateParams(Method method, Object[] argements)  {
        Parameter[] parameters = method.getParameters();//参数多个，所以是数组
        for (int i = 0; i < parameters.length; i++) {
            Parameter parameter = parameters[i];// 当前方法
            Object value = argements[i]; // 当前方法调用时传入的参数值
            VerifyParam verifyParam = parameter.getAnnotation(VerifyParam.class);
            if (verifyParam == null){
                continue;
            }
			//判断当前类型是否为基本类型
			//parameter.getParameterizedType().getTypeName())反射方法，用于获取方法参数的类型名称。
            if (ArrayUtils.contains(TYPE_BASIS,parameter.getParameterizedType().getTypeName())){
				//值
				checkValue(value,verifyParam);
            }else {
                //对象
				checkObjValue(parameter,value);
            }
        }
    }

	public void checkObjValue(Parameter parameter,Object value)  {
		try {
			String typename = parameter.getParameterizedType().getTypeName();
			//获取该类型的class对象
			Class calssz = Class.forName(typename);
			//获取该对象的所有字段
			Field[] fileds = calssz.getDeclaredFields();
			for (Field field : fileds){
				VerifyParam fieldVerifyParam = field.getAnnotation(VerifyParam.class);
				if (fieldVerifyParam == null){
					continue;
				}
				//如果字段有非public的值，需要调用此方法，否则获取不到
				field.setAccessible(true);
				//获取当前字段的值
				Object resultValue = field.get(value);
				checkValue(resultValue,fieldVerifyParam);
			}
		}catch (BusinessException  e){
			logger.error("参数校验失败",e);
			throw e;
		} catch (Exception e) {
			logger.error("参数校验失败",e);
			throw new BusinessException(ResponseCodeEnum.CODE_600);
		}
	}

    // 获取VerifyParam里面定义的属性
    private void checkValue(Object value,VerifyParam verifyParam){
		Boolean isEmpty = value==null|| StringTools.isEmpty(value.toString());
		Integer length = value==null?0:value.toString().length();
		//校验空
		if (isEmpty && verifyParam.required()){
			throw new BusinessException(ResponseCodeEnum.CODE_600);
		}
		//校验长度
		if (!isEmpty && verifyParam.max() !=-1 && verifyParam.max()<length||verifyParam.min()!=-1&&verifyParam.min()>length){
			throw new BusinessException(ResponseCodeEnum.CODE_600);
		}
		//校验正则
		if (!isEmpty && StringTools.isEmpty(verifyParam.regex().getRegex()) && VerifyUtils.verify(verifyParam.regex(),String.valueOf(value))){
			throw new BusinessException(ResponseCodeEnum.CODE_600);
		}
    }

}
```

StringTools：

```java
public class StringTools {

    /**
     * 判断字符串为空
     * @param str
     * @return
     */
    public static boolean isEmpty(String str){
        if (str==null || "".equals(str) || "null".equals(str) || "\u0000".equals(str)) {
            return true;
        } else return "".equals(str.trim());
    }
}
```

VerifyUtils：

```java
public class VerifyUtils {

    // regex为指定的匹配规则，value为传入的待匹配校验的值
    public static boolean verify(String regex,String value){
        if(StringTools.isEmpty(value)){
            return false;
        }
        Pattern pattern = Pattern.compile(regex);
        Matcher matcher = pattern.matcher(value);
        //指示整个value字符串是否与regex模式匹配。
        return matcher.matches();
    }

    public static boolean verify(VerifyRegexEnum regex, String value){
        return verify(regex.getRegex(),value);
    }
}
```

VerifyRegexEnum：

定义具体的匹配规则。

```java
public enum VerifyRegexEnum {

    NO("", "不校验"),
    EMAIL("^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\\.[a-zA-Z0-9_-]+)+$", "邮箱"),
    PASSWORD("^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,16}$","密码");

    private String regex;
    private String desc;

    VerifyRegexEnum(String regex, String desc) {
        this.regex = regex;
        this.desc = desc;
    }

    public String getRegex() {
        return regex;
    }

    public void setRegex(String regex) {
        this.regex = regex;
    }

    public String getDesc() {
        return desc;
    }

    public void setDesc(String desc) {
        this.desc = desc;
    }
}
```

具体方法的使用：

```java
@RequestMapping("/sendEmailCode")
	@Globallnterceptor(checkParams = true)
    public ResponseVO sendEmailCode(HttpSession session,
									@VerifyParam(required = true,regex = VerifyRegexEnum.EMAIL) String email,
									@VerifyParam(required = true) String checkCode,
									@VerifyParam(required = true) Integer type) throws MessagingException {
		try {
			//如果前端没有传Email checkcode等，可能会报空指针异常，每个都是用if判断太麻烦，可以使用AOP参数校验
			if (!checkCode.equalsIgnoreCase((String) session.getAttribute(Constants.CHECK_CODE_KEY_EMAIL))){
				throw new BusinessException("验证码错误");
			}
			emailInfoService.sendEmailCode(email,type);
			return getSuccessResponseVO(null);
		}finally {
			session.removeAttribute(Constants.CHECK_CODE_KEY_EMAIL);
		}
	}
```
