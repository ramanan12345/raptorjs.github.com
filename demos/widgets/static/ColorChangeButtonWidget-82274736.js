define.Class("ui/demo/ColorChangeButton/ColorChangeButtonWidget",function(e){return{init:function(t){this.colors=t.colors,this.curColor=0,this.$rootEl=this.$(),this.$rootEl.click(function(e){this.nextColor(),this.publish("click",{button:this})}.bind(this)),e("raptor/pubsub").subscribe("changeButtonColors",function(){this.nextColor()},this)},nextColor:function(){var e=this.colors[this.curColor++%this.colors.length];this.$rootEl.css("background-color",e)}}});