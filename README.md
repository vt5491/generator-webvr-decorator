# generator-webvr-decorator 

> Yeoman webvr-decorator generator - Adds [WebVR](http://webvr.info/) capability to an exisitng application.
> 
> Note: currently only applications generated with the [angular generator](https://github.com/yeoman/generator-angular#readme) are supported.  But the generator has been desigined to accomodate multiple application formats.  Additional application formats such as [Webapp](https://github.com/yeoman/generator-webapp#readme) are planned for the future.

WebVR and three.js are very powerful platforms.  When running together, these libraries allow you create full VR-enabled web applications that run directly on any WebVR enabled browser.  When you click on the "WebVR" fullscreen icon of a running application, you will generate a split-screen view suitable for viewing on a VR head-mounted display such as Oculus Rift, or Google Cardboard.

Unfortunatley, both WebVR and three.js involve large amounts of tedious boilerplate.  If you've never created a WebVR app before, it may take you several days to figure what needs to be done as documentation is sparse.  Even experienced WebVR application developers may find it takes several hours to set up a basic application, particularly when you have to integrate it into a non-trivial platform such as angular.

webvr-decorator allows you to inject the necessary code into an existing application that allows you to display a [basic VR enabled scene of a rotating cube](http://vt5491.github.io/#/).  And by using a generator, you get a simple but useful skeleton architecture utilizing standard WebVR best practicies, providing a solid foundation for your own application.

## Getting Started

```bash
npm install -g generator-webvr-decorator
```
Install your basic target application.  For example angular ([see here for how to generate an angular application](https://github.com/yeoman/generator-angular#readme) 

Make sure you are in the directory that has the application you wish to "decorate" with WebVR:
```
cd /path/to/my/app
```
Run the generator
```bash
yo webvr-decorator
```
The generator will confirm if you wish to continue:
```bash
? Add webVR capability to this application ? (Y/n) 
```
The generator will update several files.  It will ask for permision first.  Reply with 'y' to update a single file, or specify 'a' to update all files:
```bash
? Overwrite app/scripts/services/main.js? (Ynaxdh)
```

After the required libraries are installed (something that can take several minutes), run start your angular app like always:
```bash
grunt serve
```

The application supports WASD keys to move around:
```bash
w: move camera forward
s: move camera backward
d: move camera right
a: move camera left
e: rotate cube clockwise
q: rotate cube counter-clockwise
```
The webVR enabled rotating cube scene will be at the following URL:
```bash
http://localhost:9000/#/
```

Note: it is recommended you only install into a 'vanilla' angular app i.e as it exists immediately after running the angular generator.  The generator has only been tested on angular apps of this form.  If you are going to install to a non-vanilla app, it is recommended you make a backup first.

## ScreenShots
The following were run on [Mozilla nightly build](https://nightly.mozilla.org/)

pre VR expansion:

![](images/webvr-decorator-screen-shot.png)

with VR expansion:
![](images/webvr-decorator-screen-shot-vr-mode.png)

Running app available [here](http://vt5491.github.io/#/)

## Additional
Skip installing the libraries (useful if running multiple times):

```bash
yo webvr-decorator --skipInstall
```
## License

MIT


