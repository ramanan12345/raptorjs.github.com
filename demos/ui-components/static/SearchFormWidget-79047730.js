define.Class("ui/search/SearchForm/SearchFormWidget",function(e){var t=e("raptor/pubsub"),n=e("ebay-api/finding");return{init:function(e){var t=this;this.$().submit(function(){try{t._handleSubmit()}catch(e){console.error(e)}return!1})},_handleSubmit:function(){var e=n.performSearch({keywords:this.getKeywords(),categoryId:parseInt(this.getCategoryId())}),r=e.state()==="pending";r&&t.publish("searchBegin"),e.done(function(e){t.publish("searchResults",{data:e}),t.publish("searchEnd")}).fail(function(e,t,n){console.error("ERROR: ",n)}).always(function(){r&&t.publish("searchEnd")})},getKeywords:function(){return document.getElementById("search-form-keywords").value},getCategoryId:function(){return $("#search-form-cat").val()}}});