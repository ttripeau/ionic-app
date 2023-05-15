![Built With Stencil](https://img.shields.io/badge/-Built%20With%20Stencil-16161d.svg?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjIuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI%2BCjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI%2BCgkuc3Qwe2ZpbGw6I0ZGRkZGRjt9Cjwvc3R5bGU%2BCjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik00MjQuNywzNzMuOWMwLDM3LjYtNTUuMSw2OC42LTkyLjcsNjguNkgxODAuNGMtMzcuOSwwLTkyLjctMzAuNy05Mi43LTY4LjZ2LTMuNmgzMzYuOVYzNzMuOXoiLz4KPHBhdGggY2xhc3M9InN0MCIgZD0iTTQyNC43LDI5Mi4xSDE4MC40Yy0zNy42LDAtOTIuNy0zMS05Mi43LTY4LjZ2LTMuNkgzMzJjMzcuNiwwLDkyLjcsMzEsOTIuNyw2OC42VjI5Mi4xeiIvPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNNDI0LjcsMTQxLjdIODcuN3YtMy42YzAtMzcuNiw1NC44LTY4LjYsOTIuNy02OC42SDMzMmMzNy45LDAsOTIuNywzMC43LDkyLjcsNjguNlYxNDEuN3oiLz4KPC9zdmc%2BCg%3D%3D&colorA=16161d&style=flat-square)

# jeep-photoviewer
Stencil web component using a CSS grid to display `one` image or a set of images as `gallery` or `slider` and using CSS snap points to walk through images. A selected image can be viewed in `fullscreen` mode with `zoom in/out and pan` capabilities.

The Web component tag is <jeep-photoviewer> is the main component. It is using the following embedded components:

 - <jeep-photo-hscroll> Horizontal scrolling through images.
 - <jeep-photo-buttons> Set of buttons (`Share` , `Fullscreen`, `Close`)
                        which could be `visible` or `hidden` (Single Tap).
 - <jeep-photo-zoom> Zoom In (Double Tap) / Out (Single Tap) and Pan features.
 - <jeep-photo-share> Based on Web Share API. No fallback for Browsers
                      not compatible with Web Share API.
                       
All components use `Shadow DOM`

Since 1.1.0, the background color can be specified in the options parameter and must be in the range 

`["white","ivory","lightgrey","darkgrey","dimgrey", "grey", "black"]`


## Getting Started

### Script tag

- Put a script tag similar to this 
```html
    <script type="module" src="https://unpkg.com/jeep-photoviewer/dist/jeep-photoviewer.esm.js"></script>
    <script nomodule src="https://unpkg.com/jeep-photoviewer/dist/jeep-photoviewer.js"></script>
```
in the head of your index.html
- Then you can use the element anywhere in your template, JSX, html etc

### Node Modules
- Run `npm install jeep-photoviewer --save`
- Put a script tag similar to this 
```html
<script src='node_modules/my-component/dist/my-component.esm.js'></script>
```
in the head of your index.html
- Then you can use the element anywhere in your template, JSX, html etc

### In a stencil-starter app
- Run `npm install jeep-photoviewer --save`
- Add an import to the npm packages `import jeep-photoviewer;`
- Then you can use the element anywhere in your template, JSX, html etc

## Usage

### Grid Display
```html
<!DOCTYPE html>
<html dir="ltr" lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=5.0" />
    <title>Stencil Component Starter</title>

    <script type="module" src="https://unpkg.com/jeep-photoviewer@0.0.2/dist/jeep-photoviewer/jeep-photoviewer.esm.js"></script>
    <script nomodule src="https://unpkg.com/jeep-photoviewer@0.0.2/dist/jeep-photoviewer/jeep-photoviewer.js"></script>
  </head>
  <body>
    <jeep-photoviewer></jeep-photoviewer>
  </body>
  <style>
    body {
      background-color: #000;
    }
  </style>
  <script>
    var cmp = document.querySelector('jeep-photoviewer');
    cmp.imageList = [
      {url: "https://i.ibb.co/wBYDxLq/beach.jpg", title: "Beach Houses"},
      {url: "https://i.ibb.co/gM5NNJX/butterfly.jpg", title: "Butterfly"},
      {url: "https://i.ibb.co/10fFGkZ/car-race.jpg", title: "Car Racing"},
      {url: "https://i.ibb.co/ygqHsHV/coffee-milk.jpg", title: "Coffee with Milk"},
      {url: "https://i.ibb.co/7XqwsLw/fox.jpg", title: "Fox"},
      {url: "https://i.ibb.co/L1m1NxP/girl.jpg", title: "Mountain Girl"},
      {url: "https://i.ibb.co/wc9rSgw/desserts.jpg", title: "Desserts Table"},
      {url: "https://i.picsum.photos/id/1009/5000/7502.jpg?hmac=Uj6crVILzsKbyZreBjHuMiaq_-n30qoHjqP0i7r30r8", title: "Surfer"},
      {url: "https://i.picsum.photos/id/1011/5472/3648.jpg?hmac=Koo9845x2akkVzVFX3xxAc9BCkeGYA9VRVfLE4f0Zzk", title: "On a Lac"},
      {url: "https://i.ibb.co/wdrdpKC/kitten.jpg", title: "Kitten"},
      {url: "https://i.ibb.co/dBCHzXQ/paris.jpg", title: "Paris Eiffel"},
      {url: "https://i.ibb.co/JKB0KPk/pizza.jpg", title: "Pizza Time"},
      {url: "https://i.ibb.co/VYYPZGk/salmon.jpg", title: "Salmon "},
    ];
    const options = {};
    options.maxzoomscale = 3;
    options.compressionquality = 0.6;
    cmp.options = options;
    cmp.mode = "gallery";
    cmp.addEventListener('jeepPhotoViewerResult',(ev) => {
      if(ev.detail) {
        if(ev.detail.result) {
          if( Object.keys(ev.detail).includes("imageIndex")) {
            console.log(`${ev.detail.imageIndex}`);
          }
          if( Object.keys(ev.detail).includes("message")) {
            console.log(`${ev.detail.message}`);
          }
        } else {
          console.log(`${ev.detail.message}`);
        }
      }
    },false);
  </script>
</html>

```

### One Image Display

```html
<!DOCTYPE html>
<html dir="ltr" lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=5.0" />
    <title>Stencil Component Starter</title>

    <script type="module" src="https://unpkg.com/jeep-photoviewer@0.0.2/dist/jeep-photoviewer/jeep-photoviewer.esm.js"></script>
    <script nomodule src="https://unpkg.com/jeep-photoviewer@0.0.2/dist/jeep-photoviewer/jeep-photoviewer.js"></script>
  </head>
  <body>
    <jeep-photoviewer></jeep-photoviewer>
  </body>
  <style>
    body {
      background-color: #000;
    }
  </style>
  <script>
    var cmp = document.querySelector('jeep-photoviewer');
      {url: "https://i.ibb.co/wBYDxLq/beach.jpg", title: "Beach Houses"},
      {url: "https://i.ibb.co/gM5NNJX/butterfly.jpg", title: "Butterfly"},
      {url: "https://i.ibb.co/10fFGkZ/car-race.jpg", title: "Car Racing"},
      {url: "https://i.ibb.co/ygqHsHV/coffee-milk.jpg", title: "Coffee with Milk"},
      {url: "https://i.ibb.co/7XqwsLw/fox.jpg", title: "Fox"},
      {url: "https://i.ibb.co/L1m1NxP/girl.jpg", title: "Mountain Girl"},
      {url: "https://i.ibb.co/wc9rSgw/desserts.jpg", title: "Desserts Table"},
      {url: "https://i.picsum.photos/id/1009/5000/7502.jpg?hmac=Uj6crVILzsKbyZreBjHuMiaq_-n30qoHjqP0i7r30r8", title: "Surfer"},
      {url: "https://i.picsum.photos/id/1011/5472/3648.jpg?hmac=Koo9845x2akkVzVFX3xxAc9BCkeGYA9VRVfLE4f0Zzk", title: "On a Lac"},
      {url: "https://i.ibb.co/wdrdpKC/kitten.jpg", title: "Kitten"},
      {url: "https://i.ibb.co/dBCHzXQ/paris.jpg", title: "Paris Eiffel"},
      {url: "https://i.ibb.co/JKB0KPk/pizza.jpg", title: "Pizza Time"},
      {url: "https://i.ibb.co/VYYPZGk/salmon.jpg", title: "Salmon "},
    const options = {};
    options.maxzoomscale = 3;
    options.compressionquality = 0.6;
    options.backgroundcolor = 'lightgrey';
    cmp.options = options;
    cmp.mode = "one";
    cmp.startFrom = 3;
    cmp.addEventListener('jeepPhotoViewerResult',(ev) => {
      if(ev.detail) {
        if(ev.detail.result) {
          if( Object.keys(ev.detail).includes("imageIndex")) {
            console.log(`${ev.detail.imageIndex}`);
          }
          if( Object.keys(ev.detail).includes("message")) {
            console.log(`${ev.detail.message}`);
          }
        } else {
          console.log(`${ev.detail.message}`);
        }
      }
    },false);
  </script>
</html>

```

### Slider Display

```html
<!DOCTYPE html>
<html dir="ltr" lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=5.0" />
    <title>Stencil Component Starter</title>

    <script type="module" src="https://unpkg.com/jeep-photoviewer@0.0.2/dist/jeep-photoviewer/jeep-photoviewer.esm.js"></script>
    <script nomodule src="https://unpkg.com/jeep-photoviewer@0.0.2/dist/jeep-photoviewer/jeep-photoviewer.js"></script>
  </head>
  <body>
    <jeep-photoviewer></jeep-photoviewer>
  </body>
  <style>
    body {
      background-color: #000;
    }
  </style>
  <script>
    var cmp = document.querySelector('jeep-photoviewer');
      {url: "https://i.ibb.co/wBYDxLq/beach.jpg", title: "Beach Houses"},
      {url: "https://i.ibb.co/gM5NNJX/butterfly.jpg", title: "Butterfly"},
      {url: "https://i.ibb.co/10fFGkZ/car-race.jpg", title: "Car Racing"},
      {url: "https://i.ibb.co/ygqHsHV/coffee-milk.jpg", title: "Coffee with Milk"},
      {url: "https://i.ibb.co/7XqwsLw/fox.jpg", title: "Fox"},
      {url: "https://i.ibb.co/L1m1NxP/girl.jpg", title: "Mountain Girl"},
      {url: "https://i.ibb.co/wc9rSgw/desserts.jpg", title: "Desserts Table"},
      {url: "https://i.picsum.photos/id/1009/5000/7502.jpg?hmac=Uj6crVILzsKbyZreBjHuMiaq_-n30qoHjqP0i7r30r8", title: "Surfer"},
      {url: "https://i.picsum.photos/id/1011/5472/3648.jpg?hmac=Koo9845x2akkVzVFX3xxAc9BCkeGYA9VRVfLE4f0Zzk", title: "On a Lac"},
      {url: "https://i.ibb.co/wdrdpKC/kitten.jpg", title: "Kitten"},
      {url: "https://i.ibb.co/dBCHzXQ/paris.jpg", title: "Paris Eiffel"},
      {url: "https://i.ibb.co/JKB0KPk/pizza.jpg", title: "Pizza Time"},
      {url: "https://i.ibb.co/VYYPZGk/salmon.jpg", title: "Salmon "},
    const options = {};
    options.maxzoomscale = 3;
    options.compressionquality = 0.6;
    options.backgroundcolor = 'ivory';
    cmp.options = options;
    cmp.mode = "slider";
    cmp.startFrom = 5;
    cmp.addEventListener('jeepPhotoViewerResult',(ev) => {
      if(ev.detail) {
        if(ev.detail.result) {
          if( Object.keys(ev.detail).includes("imageIndex")) {
            console.log(`${ev.detail.imageIndex}`);
          }
          if( Object.keys(ev.detail).includes("message")) {
            console.log(`${ev.detail.message}`);
          }
        } else {
          console.log(`${ev.detail.message}`);
        }
      }
    },false);
  </script>
</html>

```
