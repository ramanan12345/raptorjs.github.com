$rset("resource","/templating/taglibs/widgets/widgets.rtld","<raptor-taglib>\n    \n    \n    <tlib-version>1.0</tlib-version>\n    <short-name>widgets</short-name>\n    <uri>http://raptorjs.org/templates/widgets</uri>\n    \n    <attribute name=\"id\" type=\"string\"/>\n    <attribute pattern=\"event-*\" type=\"custom\" allow-expressions=\"false\"/>\n    \n    <tag>\n        \n        <name>*</name> \n        <uri>*</uri> <!-- Register attributes supported by all tags in all namespaces -->\n        \n        <attribute name=\"widget\" type=\"string\"/>\n        \n        <!-- Compiler that applies to all tags as well -->\n        <transformer>\n            <class-name>templating.taglibs.widgets.WidgetsTagTransformer</class-name>\n            <after>templating.taglibs.core.CoreTagTransformer</after>\n        </transformer>\n    </tag>\n    \n    <tag>\n        <name>widget</name>\n        <handler-class>templating.taglibs.widgets.WidgetTag</handler-class>\n        \n        <attribute name=\"jsClass\" type=\"string\"/>\n        \n        <nested-variable name=\"widget\"/>\n        \n        <imported-variable target-property=\"config\" expression=\"data.widgetConfig\"/>\n        <imported-variable target-property=\"widgetArgs\" expression=\"data.widgetArgs\"/>\n    </tag>\n    \n    <tag>\n        <name>init-widgets</name>\n        <handler-class>templating.taglibs.widgets.InitWidgetsTag</handler-class>\n        \n        <attribute name=\"includeScriptTag\" type=\"boolean\"/>\n    </tag>\n    \n</raptor-taglib>");$radd("rtld","/templating/taglibs/widgets/widgets.rtld");