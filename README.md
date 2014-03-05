TP++
==========
This TP++ button can be used on any web site, blog post, etc where you'd like to create a link on Tech.pro similar to a Facebook or G+ button.

To create a TP++ button, first create either a `<tp-button>` tag, or an element with a className of `tpbutton`, then create a script tag pointing to `tpplusplus.js`...

```html
    <tp-button></tp-button>
    <!-- OR -->
    <a class="tpbutton"></a>

    <script src="tpplusplus.min.js"></script>
</body>
</html>
```

By default, the button will create a link to the current page, but you can make the link point anywhere by adding a data attribute to the tag...

```html
<tp-button data-href="http://tech.pro/"></tp-button>
```