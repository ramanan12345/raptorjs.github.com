$rset("resource","/templating/taglibs/core/core.rtld","<raptor-taglib>\n    \n    \n    <tlib-version>1.0</tlib-version>\n    \n    <uri>http://raptorjs.org/templates/core</uri>\n    <short-name>core</short-name>\n    <prefix>c</prefix>\n    \n    <tag id=\"template\">\n        \n        <name>template</name> \n        \n        <attribute>\n            <name>name</name>\n            <allow-expressions>false</allow-expressions>\n        </attribute>\n        \n        <attribute>\n            <name>params</name>\n            <allow-expressions>false</allow-expressions>\n        </attribute>\n        \n        <attribute>\n            <name>imports</name>\n            <allow-expressions>false</allow-expressions>\n        </attribute>\n        \n        <attribute>\n            <uri>*</uri>\n            <name>functions</name>\n            <allow-expressions>false</allow-expressions>\n        </attribute>\n\n        <node-class>templating.taglibs.core.TemplateNode</node-class>\n    </tag>\n    \n    <tag extends=\"template\">\n    \n        <uri></uri>\n        <name>template</name>\n        \n    </tag>\n    \n    <tag>\n        \n        <name>*</name> \n        <uri>*</uri> <!-- Register attributes supported by all tags in all namespaces -->\n        \n        <attribute>\n            <name>space</name>\n            <type>custom</type>\n            <allow-expressions>false</allow-expressions>\n        </attribute>\n        \n        <attribute>\n            <name>whitespace</name>\n            <type>custom</type>\n            <allow-expressions>false</allow-expressions>\n        </attribute>\n        \n        <attribute>\n            <name>for</name>\n            <allow-expressions>false</allow-expressions>\n        </attribute>\n\n        <attribute>\n            <name>for-each</name>\n            <allow-expressions>false</allow-expressions>\n        </attribute>\n\n        <attribute>\n            <name>if</name>\n            <type>expression</type>\n        </attribute>\n        \n        <attribute>\n            <name>else</name>\n            <type>empty</type>\n        </attribute>\n        \n        <attribute>\n            <name>else-if</name>\n            <type>expression</type>\n        </attribute>\n        \n        <attribute>\n            <name>attrs</name>\n            <type>expression</type>\n        </attribute>\n        \n        <attribute>\n            <name>when</name>\n            <type>expression</type>\n        </attribute>\n        \n        <attribute>\n            <name>with</name>\n            <type>custom</type>\n        </attribute>\n        \n        <attribute>\n            <name>otherwise</name>\n            <type>empty</type>\n        </attribute>\n        \n        <attribute>\n            <name>parse-body-text</name>\n            <type>boolean</type>\n            <allow-expressions>false</allow-expressions>\n        </attribute>\n\n        <attribute>\n            <name>trim-body-indent</name>\n            <type>boolean</type>\n            <allow-expressions>false</allow-expressions>\n        </attribute>\n        \n        <attribute>\n            <name>strip</name>\n            <type>boolean</type>\n            <allow-expressions>false</allow-expressions>\n        </attribute>\n        \n        <attribute>\n            <name>bodyContent</name>\n            <type>expression</type>\n            <deprecated>Use \"content\" attribute instead. This will be removed in the future.</deprecated>\n        </attribute>\n        \n        <attribute>\n            <name>content</name>\n            <type>expression</type>\n        </attribute>\n        \n        <attribute>\n            <name>replace</name>\n            <type>expression</type>\n        </attribute>\n        \n        <!-- Compiler that applies to all tags as well -->\n        <transformer>\n            <class-name>templating.taglibs.core.CoreTagTransformer</class-name>\n        </transformer>\n    </tag>\n    \n    \n    \n    <tag>\n        \n        <name>for</name> \n\n        <node-class>templating.taglibs.core.ForNode</node-class>\n        \n        <attribute>\n            <name>each</name>\n            <required>false</required>\n            <allow-expressions>false</allow-expressions>\n        </attribute>\n        \n        <attribute>\n            <name>separator</name>\n            <type>string</type>\n        </attribute>\n        \n        <attribute>\n            <name>status-var</name>\n            <type>identifier</type>\n            <allow-expressions>false</allow-expressions>\n        </attribute>\n        \n        <attribute>\n            <name>varStatus</name>\n            <type>identifier</type>\n            <allow-expressions>false</allow-expressions>\n            <deprecated>Use status-var instead. This will be removed in the future.</deprecated>\n        </attribute>\n        \n        <attribute>\n            <name>for-loop</name>\n            <type>boolean</type>\n            <allow-expressions>false</allow-expressions>\n        </attribute>\n    </tag>\n    \n    <tag>\n        \n        <name>write</name> \n\n        <node-class>templating.taglibs.core.WriteNode</node-class>\n        \n        <attribute>\n            <name>value</name>\n            <required>true</required>\n            <type>expression</type>\n        </attribute>\n        \n        <attribute>\n            <name>escapeXml</name>\n            <type>boolean</type>\n            <allow-expressions>false</allow-expressions>\n            <deprecated>Use escape-xml instead. This will be removed in the future.</deprecated>\n        </attribute>\n        \n        <attribute>\n            <name>escape-xml</name>\n            <type>boolean</type>\n            <allow-expressions>false</allow-expressions>\n        </attribute>\n        \n    </tag>\n    \n    <tag>\n        \n        <name>if</name> \n\n        <node-class>templating.taglibs.core.IfNode</node-class>\n\n        <attribute>\n            <name>test</name>\n            <type>expression</type>\n        </attribute>\n\n    </tag>\n    \n    <tag>\n        <name>else</name> \n        <node-class>templating.taglibs.core.ElseNode</node-class>\n        \n        <transformer>\n            <class-name>templating.taglibs.core.ElseTagTransformer</class-name>\n            <after>templating.taglibs.core.CoreTagTransformer</after>\n            <properties>\n                <type>else</type>\n            </properties>\n        </transformer>\n    </tag>\n    \n    <tag>\n        <name>else-if</name>\n        <attribute name=\"test\" type=\"expression\"/>\n         \n        <node-class>templating.taglibs.core.ElseIfNode</node-class>\n        \n        <transformer>\n            <class-name>templating.taglibs.core.ElseTagTransformer</class-name>\n            <after>templating.taglibs.core.CoreTagTransformer</after>\n            <properties>\n                <type>else-if</type>\n            </properties>\n        </transformer>\n    </tag>\n    \n    <tag>\n        \n        <name>invoke</name> \n\n        <node-class>templating.taglibs.core.InvokeNode</node-class>\n\n        <attribute>\n            <name>function</name>\n            <type>custom</type>\n            <allow-expressions>false</allow-expressions>\n            <required>true</required>\n        </attribute>\n\n        <attribute>\n            <name>*</name>\n            <uri></uri>\n            <type>string</type>\n            <allow-expressions>true</allow-expressions>\n        </attribute>\n    </tag>\n    \n    <tag>\n        \n        <name>choose</name> \n\n        <node-class>templating.taglibs.core.ChooseNode</node-class>\n\n    </tag>\n\n    <tag>\n        \n        <name>when</name> \n\n        <node-class>templating.taglibs.core.WhenNode</node-class>\n\n        <attribute>\n            <name>test</name>\n            <type>expression</type>\n        </attribute>\n        \n    </tag>\n    \n    <tag>\n        \n        <name>otherwise</name> \n\n        <node-class>templating.taglibs.core.OtherwiseNode</node-class>\n\n    </tag>\n        \n    <tag>\n        \n        <name>def</name> \n\n        <node-class>templating.taglibs.core.DefNode</node-class>\n\n        <attribute>\n            <name>function</name>\n            <type>custom</type>\n            <allow-expressions>false</allow-expressions>\n        </attribute>\n\n        <attribute>\n            <name>body-param</name>\n            <type>custom</type>\n            <allow-expressions>false</allow-expressions>\n        </attribute>\n        \n    </tag>\n    \n    <tag>\n        \n        <name>with</name> \n\n        <node-class>templating.taglibs.core.WithNode</node-class>\n\n        <attribute>\n            <name>vars</name>\n            <type>custom</type>\n            <allow-expressions>false</allow-expressions>\n        </attribute>\n        \n    </tag>\n    \n    <tag>\n        \n        <name>include</name> \n\n        <node-class>templating.taglibs.core.IncludeNode</node-class>\n\n        <attribute>\n            <name>template</name>\n            <type>string</type>\n        </attribute>\n        \n        <attribute>\n            <name>templateData</name>\n            <type>expression</type>\n            <deprecated>Use template-data instead. This will be removed in the future.</deprecated>\n        </attribute>\n        \n        <attribute>\n            <name>template-data</name>\n            <type>expression</type>\n        </attribute>\n        \n        <attribute>\n            <name>resource</name>\n            <type>string</type>\n        </attribute>\n        \n        <attribute>\n            <name>static</name>\n            <type>boolean</type>\n            <allow-expressions>false</allow-expressions>\n        </attribute>\n        \n        <dynamic-attributes>true</dynamic-attributes>\n        \n    </tag>\n    \n    <tag>\n        \n        <name>attr</name> \n\n        <attribute>\n            <name>name</name>\n            <type>string</type>\n        </attribute>\n        \n        <attribute>\n            <name>value</name>\n            <type>string</type>\n        </attribute>\n        \n        <attribute>\n            <name>uri</name>\n            <type>string</type>\n        </attribute>\n\n        <attribute>\n            <name>prefix</name>\n            <type>string</type>\n        </attribute>\n    </tag>\n    \n    <tag>\n        \n        <name>var</name> \n\n        <node-class>templating.taglibs.core.VarNode</node-class>\n\n        <attribute>\n            <name>name</name>\n            <type>custom</type>\n            <allow-expressions>false</allow-expressions>\n        </attribute>\n        \n        <attribute>\n            <name>value</name>\n            <type>expression</type>\n        </attribute>\n\n        <attribute>\n            <name>string-value</name>\n            <type>string</type>\n        </attribute>\n\n        <attribute>\n            <name>boolean-value</name>\n            <type>boolean</type>\n        </attribute>\n\n        <attribute>\n            <name>number-value</name>\n            <type>number</type>\n        </attribute>\n    </tag>\n    \n    <tag>\n        \n        <name>assign</name> \n\n        <node-class>templating.taglibs.core.AssignNode</node-class>\n\n        <attribute>\n            <name>var</name>\n            <type>custom</type>\n            <allow-expressions>false</allow-expressions>\n        </attribute>\n        \n        <attribute>\n            <name>value</name>\n            <type>expression</type>\n        </attribute>\n    </tag>\n    \n    <text-transformer>\n        <class-name>templating.taglibs.core.CoreTextTransformer</class-name>\n    </text-transformer>\n    \n</raptor-taglib>");$radd("rtld","/templating/taglibs/core/core.rtld");